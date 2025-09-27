import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Target, DollarSign, Calendar, TrendingUp, ShoppingBag } from "lucide-react";
import { useCreateSpendingCap, useUpdateSpendingCap, useCapMerchants } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface CapEditorProps {
  isOpen: boolean;
  onClose: () => void;
  cap?: any; // For editing existing cap
  onSuccess?: () => void;
}

const CAP_TYPES = [
  { value: "MERCHANT", label: "Merchant", icon: Store, description: "Limit spending at a specific merchant" },
  { value: "CATEGORY", label: "Category", icon: Target, description: "Limit spending in a specific category" },
  { value: "GLOBAL", label: "Global", icon: DollarSign, description: "Overall spending limit" },
];

const CAP_PERIODS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Utilities",
  "Other"
];

export default function CapEditor({ isOpen, onClose, cap, onSuccess }: CapEditorProps) {
  const [formData, setFormData] = useState({
    type: "MERCHANT",
    name: "",
    limit: "",
    period: "MONTHLY",
    category: "",
    merchant: "",
    enabled: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMerchantSuggestions, setShowMerchantSuggestions] = useState(false);

  const createCapMutation = useCreateSpendingCap();
  const updateCapMutation = useUpdateSpendingCap();
  const { data: suggestedMerchants = [], isLoading: isLoadingMerchants } = useCapMerchants('90');

  const isEditing = !!cap;

  useEffect(() => {
    if (cap) {
      setFormData({
        type: cap.type || "MERCHANT",
        name: cap.name || "",
        limit: cap.limit?.toString() || "",
        period: cap.period || "MONTHLY",
        category: cap.category || "",
        merchant: cap.merchant || "",
        enabled: cap.enabled !== undefined ? cap.enabled : true,
      });
    } else {
      setFormData({
        type: "MERCHANT",
        name: "",
        limit: "",
        period: "MONTHLY",
        category: "",
        merchant: "",
        enabled: true,
      });
    }
    setErrors({});
    setShowMerchantSuggestions(false);
  }, [cap, isOpen]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.merchant-suggestions')) {
        setShowMerchantSuggestions(false);
      }
    };

    if (showMerchantSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMerchantSuggestions]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      newErrors.limit = "Limit must be greater than 0";
    }

    if (formData.type === "CATEGORY" && !formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.type === "MERCHANT" && !formData.merchant.trim()) {
      newErrors.merchant = "Merchant name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const capData = {
        type: formData.type as "MERCHANT" | "CATEGORY" | "GLOBAL",
        name: formData.name.trim(),
        limit: parseFloat(formData.limit),
        period: formData.period as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
        ...(formData.type === "CATEGORY" && { category: formData.category }),
        ...(formData.type === "MERCHANT" && { merchant: formData.merchant.trim() }),
      };

      if (isEditing) {
        await updateCapMutation.mutateAsync({
          id: cap.id,
          data: capData,
        });
      } else {
        await createCapMutation.mutateAsync(capData);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving cap:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleMerchantSelect = (merchantName: string) => {
    setFormData(prev => ({ ...prev, merchant: merchantName }));
    setShowMerchantSuggestions(false);
    if (errors.merchant) {
      setErrors(prev => ({ ...prev, merchant: "" }));
    }
  };

  const selectedType = CAP_TYPES.find(t => t.value === formData.type);
  const TypeIcon = selectedType?.icon || Store;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5" />
            {isEditing ? "Edit Spending Cap" : "Add New Spending Cap"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Cap Type Selection */}
            <div className="space-y-3">
              <Label>Cap Type</Label>
              <div className="grid grid-cols-1 gap-3">
                {CAP_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all ${
                        formData.type === type.value
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleInputChange("type", type.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter cap name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <Label htmlFor="limit">Limit ($) *</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.limit}
                onChange={(e) => handleInputChange("limit", e.target.value)}
                placeholder="0.00"
                className={errors.limit ? "border-destructive" : ""}
              />
              {errors.limit && <p className="text-sm text-destructive">{errors.limit}</p>}
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select value={formData.period} onValueChange={(value) => handleInputChange("period", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAP_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {period.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category (for CATEGORY type) */}
            {formData.type === "CATEGORY" && (
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>
            )}

            {/* Merchant (for MERCHANT type) */}
            {formData.type === "MERCHANT" && (
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant Name *</Label>
                <div className="relative">
                  <Input
                    id="merchant"
                    value={formData.merchant}
                    onChange={(e) => handleInputChange("merchant", e.target.value)}
                    onFocus={() => setShowMerchantSuggestions(true)}
                    placeholder="Enter merchant name"
                    className={errors.merchant ? "border-destructive" : ""}
                  />
                  
                  {/* Merchant Suggestions */}
                  {showMerchantSuggestions && suggestedMerchants.length > 0 && (
                    <div className="merchant-suggestions absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 text-xs text-muted-foreground border-b">
                        Suggested merchants from your transaction history:
                      </div>
                      {suggestedMerchants.slice(0, 10).map((merchant: any) => (
                        <button
                          key={merchant.name}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center justify-between"
                          onClick={() => handleMerchantSelect(merchant.name)}
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{merchant.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              ${merchant.totalSpent.toFixed(0)}
                            </Badge>
                            <span>{merchant.transactionCount} visits</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.merchant && <p className="text-sm text-destructive">{errors.merchant}</p>}
                
                {/* Quick Stats for Selected Merchant */}
                {formData.merchant && suggestedMerchants.find((m: any) => m.name === formData.merchant) && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Spending Insights</span>
                    </div>
                    {(() => {
                      const merchant = suggestedMerchants.find((m: any) => m.name === formData.merchant);
                      return (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Spent:</span>
                            <span className="ml-1 font-medium">${merchant.totalSpent.toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Visits:</span>
                            <span className="ml-1 font-medium">{merchant.transactionCount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg per Visit:</span>
                            <span className="ml-1 font-medium">${merchant.averageSpent.toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Period:</span>
                            <span className="ml-1 font-medium">Last 90 days</span>
                          </div>
                          <div className="col-span-2 mt-2 p-2 bg-primary/10 rounded border border-primary/20">
                            <div className="flex items-center gap-2 text-primary">
                              <Target className="w-4 h-4" />
                              <span className="text-sm font-medium">Suggested Limit</span>
                            </div>
                            <p className="text-sm text-primary mt-1">
                              Based on your spending pattern, consider setting a limit of{' '}
                              <span className="font-semibold">
                                ${(() => {
                                  const merchant = suggestedMerchants.find((m: any) => m.name === formData.merchant);
                                  const suggestedLimit = Math.ceil(merchant.totalSpent * 1.2); // 20% above current spending
                                  return suggestedLimit;
                                })()}
                              </span>{' '}
                              for this merchant.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => {
                                const merchant = suggestedMerchants.find((m: any) => m.name === formData.merchant);
                                const suggestedLimit = Math.ceil(merchant.totalSpent * 1.2);
                                handleInputChange("limit", suggestedLimit.toString());
                              }}
                            >
                              Use Suggested Limit
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Cap will be active and monitor spending
                </p>
              </div>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => handleInputChange("enabled", checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCapMutation.isPending || updateCapMutation.isPending}
            >
              {createCapMutation.isPending || updateCapMutation.isPending ? (
                "Saving..."
              ) : (
                isEditing ? "Update Cap" : "Create Cap"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
