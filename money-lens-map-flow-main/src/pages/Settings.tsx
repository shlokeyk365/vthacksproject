import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { 
  User, 
  Bell, 
  Map, 
  Download, 
  Upload, 
  Trash2,
  Shield,
  Moon,
  Sun,
  Palette,
  Database,
  Key,
  Monitor
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { theme, setTheme, resolvedTheme, primaryColor, setPrimaryColor, colorSchemes } = useTheme();
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    monthlyBudgetGoal: 0,
  });

  const [notifications, setNotifications] = useState({
    capAlerts: true,
    weeklyReports: true,
    budgetWarnings: true,
    transactionAlerts: false,
  });

  const [mapSettings, setMapSettings] = useState({
    defaultLocation: "Blacksburg, VA",
    mapboxToken: "",
    showHeatmap: true,
    showMerchantPins: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingMap, setIsSavingMap] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Load user data into form
  useEffect(() => {
    if (profileData) {
      setProfileForm({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        monthlyBudgetGoal: profileData.monthlyBudgetGoal || 0,
      });
    }
  }, [profileData]);

  // Handle profile form changes
  const handleProfileChange = (field: string, value: string | number) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profileData) return;
    
    setIsSaving(true);
    
    // Show loading notification
    const loadingToast = toast.loading('Saving your changes...', {
      description: 'Please wait while we update your profile',
    });
    
    try {
      // Include email in profile update (backend now supports email changes)
      const response = await apiClient.updateProfile(profileForm);
      
      if (response.success) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Profile updated successfully!', {
          description: 'Your account changes have been saved',
          duration: 4000,
        });
        
        // Reset unsaved changes flag
        setHasUnsavedChanges(false);
        
        // Refresh profile data after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to update profile', {
          description: response.message || 'Please try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to update profile', {
        description: error.message || 'Please check your connection and try again',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save notification settings
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    
    const loadingToast = toast.loading('Saving notification preferences...', {
      description: 'Updating your notification settings',
    });
    
    try {
      // Simulate API call (replace with actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToast);
      toast.success('Notification preferences saved!', {
        description: 'Your notification settings have been updated',
        duration: 3000,
      });
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save notifications', {
        description: 'Please try again',
        duration: 4000,
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Save map settings
  const handleSaveMapSettings = async () => {
    setIsSavingMap(true);
    
    const loadingToast = toast.loading('Saving map settings...', {
      description: 'Updating your map configuration',
    });
    
    try {
      // Simulate API call (replace with actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToast);
      toast.success('Map settings saved!', {
        description: 'Your map configuration has been updated',
        duration: 3000,
      });
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save map settings', {
        description: 'Please try again',
        duration: 4000,
      });
    } finally {
      setIsSavingMap(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please ensure both new passwords are identical',
        duration: 4000,
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long',
        duration: 4000,
      });
      return;
    }

    setIsChangingPassword(true);

    const loadingToast = toast.loading('Changing password...', {
      description: 'Please wait while we update your password',
    });

    try {
      const response = await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success('Password changed successfully!', {
          description: 'Your password has been updated',
          duration: 4000,
        });

        // Reset form and close dialog
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsPasswordDialogOpen(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to change password', {
          description: response.message || 'Please check your current password and try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to change password', {
        description: error.message || 'Please check your current password and try again',
        duration: 5000,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and application configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    value={profileForm.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    value={profileForm.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    disabled={profileLoading}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  type="email"
                  disabled={profileLoading}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Monthly Budget Goal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input 
                    value={profileForm.monthlyBudgetGoal}
                    onChange={(e) => handleProfileChange('monthlyBudgetGoal', parseFloat(e.target.value) || 0)}
                    className="pl-8"
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={profileLoading}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSaveProfile}
                disabled={isSaving || profileLoading}
                className={`w-full ${hasUnsavedChanges ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
              >
                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Profile Changes •' : 'Save Profile Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Spending Cap Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you approach spending limits
                  </p>
                </div>
                <Switch
                  checked={notifications.capAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, capAlerts: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly spending summaries
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyReports: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Budget Warnings</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when approaching monthly budget limit
                  </p>
                </div>
                <Switch
                  checked={notifications.budgetWarnings}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, budgetWarnings: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transaction Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Instant notifications for all transactions
                  </p>
                </div>
                <Switch
                  checked={notifications.transactionAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, transactionAlerts: checked })
                  }
                />
              </div>
              
              <Button 
                onClick={handleSaveNotifications}
                disabled={isSavingNotifications}
                className="w-full"
              >
                {isSavingNotifications ? 'Saving...' : 'Save Notification Preferences'}
              </Button>
            </CardContent>
          </Card>

          {/* Map Configuration */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Map Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Default Location</label>
                <Input 
                  value={mapSettings.defaultLocation}
                  onChange={(e) => setMapSettings({ ...mapSettings, defaultLocation: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Mapbox Access Token
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </label>
                <Input 
                  type="password"
                  placeholder="pk.eyJ1..."
                  value={mapSettings.mapboxToken}
                  onChange={(e) => setMapSettings({ ...mapSettings, mapboxToken: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your free token from <a href="https://mapbox.com" target="_blank" className="text-primary underline">mapbox.com</a>
                </p>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Spending Heatmap</p>
                  <p className="text-sm text-muted-foreground">
                    Display color-coded spending intensity
                  </p>
                </div>
                <Switch
                  checked={mapSettings.showHeatmap}
                  onCheckedChange={(checked) =>
                    setMapSettings({ ...mapSettings, showHeatmap: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Merchant Pins</p>
                  <p className="text-sm text-muted-foreground">
                    Display clickable merchant markers
                  </p>
                </div>
                <Switch
                  checked={mapSettings.showMerchantPins}
                  onCheckedChange={(checked) =>
                    setMapSettings({ ...mapSettings, showMerchantPins: checked })
                  }
                />
              </div>
              
              <Button 
                onClick={handleSaveMapSettings}
                disabled={isSavingMap}
                className="w-full"
              >
                {isSavingMap ? 'Saving...' : 'Save Map Settings'}
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export All Data
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
              </div>
              
              <Separator />
              
              <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
                <h4 className="font-semibold text-danger mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="w-4 h-4" />
                    System
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Current theme: {resolvedTheme} {theme === "system" && "(follows system)"}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium mb-3 block">Primary Color</label>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.primary}
                      onClick={() => {
                        setPrimaryColor(scheme.primary);
                        toast.success('Primary color updated!', {
                          description: `Switched to ${scheme.name} theme`,
                          duration: 2000,
                        });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        primaryColor === scheme.primary 
                          ? 'border-primary ring-2 ring-primary ring-opacity-50' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      title={scheme.description}
                    >
                      <div 
                        className="w-full h-6 rounded-md mb-2"
                        style={{ backgroundColor: `hsl(${scheme.primary})` }}
                      />
                      <div className="text-xs font-medium text-left">{scheme.name}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Current: {colorSchemes.find(s => s.primary === primaryColor)?.name || 'Financial Blue'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter your new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className="flex-1"
                      >
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(false)}
                        disabled={isChangingPassword}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="w-full">
                Enable 2FA
              </Button>
              
              <Separator />
              
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  Last login: 2 hours ago
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Transactions</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Caps</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Account Age</span>
                <span className="font-semibold">6 months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Data Size</span>
                <span className="font-semibold">2.4 MB</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}