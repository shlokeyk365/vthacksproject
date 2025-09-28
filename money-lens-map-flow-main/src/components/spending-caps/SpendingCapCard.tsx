import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Target, 
  DollarSign, 
  Calendar, 
  Edit, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToggleSpendingCap } from "@/hooks/useApi";
import CapEditor from "./CapEditor";
import DeleteCapDialog from "./DeleteCapDialog";

interface SpendingCapCardProps {
  cap: any;
  onUpdate?: () => void;
}

export default function SpendingCapCard({ cap, onUpdate }: SpendingCapCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const toggleCapMutation = useToggleSpendingCap();

  const getCapStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: "exceeded", color: "danger" };
    if (percentage >= 80) return { status: "warning", color: "warning" };
    return { status: "safe", color: "success" };
  };

  const getMerchantLogo = (merchantName: string) => {
    const merchant = merchantName.toLowerCase();
    
    // Fast Food & Restaurants
    if (merchant.includes('taco bell') || merchant.includes('tacobell')) {
      return { icon: '🌮', bgColor: 'bg-purple-600', textColor: 'text-white' };
    }
    if (merchant.includes('starbucks') || merchant.includes('starbucks coffee')) {
      return { icon: '☕', bgColor: 'bg-green-600', textColor: 'text-white' };
    }
    if (merchant.includes('mcdonald') || merchant.includes('mcdonalds')) {
      return { icon: '🍟', bgColor: 'bg-yellow-500', textColor: 'text-white' };
    }
    if (merchant.includes('subway')) {
      return { icon: '🥪', bgColor: 'bg-green-600', textColor: 'text-white' };
    }
    if (merchant.includes('chipotle')) {
      return { icon: '🌯', bgColor: 'bg-orange-600', textColor: 'text-white' };
    }
    if (merchant.includes('uber') || merchant.includes('lyft')) {
      return { icon: '🚗', bgColor: 'bg-black', textColor: 'text-white' };
    }
    if (merchant.includes('amazon')) {
      return { icon: '📦', bgColor: 'bg-orange-500', textColor: 'text-white' };
    }
    
    // Movie Theaters
    if (merchant.includes('regal') || merchant.includes('regal cinemas')) {
      return { icon: '🎬', bgColor: 'bg-blue-700', textColor: 'text-white' };
    }
    if (merchant.includes('amc') || merchant.includes('amc theaters')) {
      return { icon: '🍿', bgColor: 'bg-red-700', textColor: 'text-white' };
    }
    
    // Schools & Education
    if (merchant.includes('virginia tech') || merchant.includes('vt') || merchant.includes('vtech')) {
      return { icon: '🎓', bgColor: 'bg-orange-700', textColor: 'text-white' };
    }
    if (merchant.includes('university') || merchant.includes('college') || merchant.includes('school')) {
      return { icon: '🏫', bgColor: 'bg-blue-800', textColor: 'text-white' };
    }
    if (merchant.includes('library')) {
      return { icon: '📚', bgColor: 'bg-yellow-700', textColor: 'text-white' };
    }
    
    // Utilities & Services
    if (merchant.includes('electric') || merchant.includes('power') || merchant.includes('energy') || merchant.includes('duke energy') || merchant.includes('dominion')) {
      return { icon: '⚡', bgColor: 'bg-yellow-500', textColor: 'text-black' };
    }
    if (merchant.includes('water') || merchant.includes('sewer')) {
      return { icon: '💧', bgColor: 'bg-blue-500', textColor: 'text-white' };
    }
    if (merchant.includes('gas') || merchant.includes('natural gas')) {
      return { icon: '🔥', bgColor: 'bg-orange-500', textColor: 'text-white' };
    }
    if (merchant.includes('internet') || merchant.includes('wifi') || merchant.includes('comcast') || merchant.includes('verizon')) {
      return { icon: '📶', bgColor: 'bg-blue-600', textColor: 'text-white' };
    }
    if (merchant.includes('phone') || merchant.includes('cellular') || merchant.includes('at&t') || merchant.includes('t-mobile')) {
      return { icon: '📱', bgColor: 'bg-purple-600', textColor: 'text-white' };
    }
    
    return null;
  };

  const getCategoryLogo = (categoryName: string) => {
    const category = categoryName.toLowerCase();
    
    // Category-specific logos
    if (category.includes('entertainment') || category.includes('movies') || category.includes('streaming')) {
      return { icon: '🎬', bgColor: 'bg-purple-600', textColor: 'text-white' };
    }
    if (category.includes('grocery') || category.includes('food') || category.includes('dining')) {
      return { icon: '🛒', bgColor: 'bg-green-600', textColor: 'text-white' };
    }
    if (category.includes('transportation') || category.includes('travel')) {
      return { icon: '🚗', bgColor: 'bg-blue-600', textColor: 'text-white' };
    }
    if (category.includes('utilities') || category.includes('bills')) {
      return { icon: '⚡', bgColor: 'bg-yellow-500', textColor: 'text-black' };
    }
    if (category.includes('shopping') || category.includes('retail')) {
      return { icon: '🛍️', bgColor: 'bg-pink-600', textColor: 'text-white' };
    }
    if (category.includes('healthcare') || category.includes('medical')) {
      return { icon: '🏥', bgColor: 'bg-red-600', textColor: 'text-white' };
    }
    if (category.includes('education') || category.includes('school')) {
      return { icon: '🎓', bgColor: 'bg-blue-700', textColor: 'text-white' };
    }
    if (category.includes('gas') || category.includes('fuel')) {
      return { icon: '⛽', bgColor: 'bg-yellow-500', textColor: 'text-black' };
    }
    
    return null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MERCHANT": return Store;
      case "CATEGORY": return Target;
      case "GLOBAL": return DollarSign;
      default: return Target;
    }
  };

  const handleToggle = async () => {
    try {
      await toggleCapMutation.mutateAsync(cap.id);
      onUpdate?.();
    } catch (error) {
      console.error("Error toggling cap:", error);
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    onUpdate?.();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteOpen(false);
    onUpdate?.();
  };

  const IconComponent = getTypeIcon(cap.type);
  const { status, color } = getCapStatus(cap.spent || 0, cap.limit);
  const percentage = Math.min(((cap.spent || 0) / cap.limit) * 100, 100);
  const remaining = cap.limit - (cap.spent || 0);
  
  // Get appropriate logo based on cap type
  const merchantLogo = cap.type === "MERCHANT" && cap.merchant ? getMerchantLogo(cap.merchant) : null;
  const categoryLogo = cap.type === "CATEGORY" && cap.category ? getCategoryLogo(cap.category) : null;
  const displayLogo = merchantLogo || categoryLogo;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${cap.enabled ? 'card-gradient' : 'opacity-60'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {displayLogo ? (
                  <div className={`p-2 rounded-lg ${displayLogo.bgColor} ${displayLogo.textColor} flex items-center justify-center w-8 h-8`}>
                    <span className="text-lg">{displayLogo.icon}</span>
                  </div>
                ) : (
                  <div className={`p-2 rounded-lg ${
                    color === 'danger' ? 'bg-danger/10' :
                    color === 'warning' ? 'bg-warning/10' : 'bg-success/10'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      color === 'danger' ? 'text-danger' :
                      color === 'warning' ? 'text-warning' : 'text-success'
                    }`} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{cap.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {cap.type.charAt(0).toUpperCase() + cap.type.slice(1).toLowerCase()}
                    </Badge>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>{cap.period.charAt(0).toUpperCase() + cap.period.slice(1).toLowerCase()}</span>
                    {cap.category && (
                      <>
                        <span>•</span>
                        <span>{cap.category}</span>
                      </>
                    )}
                    {cap.merchant && (
                      <>
                        <span>•</span>
                        <span>{cap.merchant}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <p className="text-sm text-muted-foreground">
                    ${(cap.spent || 0).toFixed(2)} / ${cap.limit.toFixed(2)}
                  </p>
                  <p className={`text-sm font-medium ${
                    color === 'danger' ? 'text-danger' :
                    color === 'warning' ? 'text-warning' : 'text-success'
                  }`}>
                    {percentage.toFixed(0)}% used
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  disabled={toggleCapMutation.isPending}
                >
                  {cap.enabled ? (
                    <ToggleRight className="w-5 h-5 text-primary" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={percentage} 
                className={`h-2 ${
                  color === 'danger' ? '[&>div]:bg-danger' :
                  color === 'warning' ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                }`}
              />
              
              {status === "exceeded" && (
                <div className="flex items-center gap-2 text-sm text-danger">
                  <AlertTriangle className="w-4 h-4" />
                  Cap exceeded by ${Math.abs(remaining).toFixed(2)}
                </div>
              )}
              
              {status === "warning" && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  Approaching limit - ${remaining.toFixed(2)} remaining
                </div>
              )}

              {status === "safe" && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  ${remaining.toFixed(2)} remaining
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <CapEditor
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        cap={cap}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Dialog */}
      <DeleteCapDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        cap={cap}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
