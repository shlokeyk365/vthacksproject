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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  Monitor,
  Settings as SettingsIcon
} from "lucide-react";
import { ColorPicker } from "@/components/ui/ColorPicker";

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
  
  // 2FA state
  const [is2FASetupLoading, setIs2FASetupLoading] = useState(false);
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [is2FADisabling, setIs2FADisabling] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [is2FASetupDialogOpen, setIs2FASetupDialogOpen] = useState(false);
  const [is2FAVerifyDialogOpen, setIs2FAVerifyDialogOpen] = useState(false);
  
  // Data management state
  const [isExportingData, setIsExportingData] = useState(false);
  const [isImportingData, setIsImportingData] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [dataStats, setDataStats] = useState({
    totalTransactions: 0,
    activeCaps: 0,
    totalNotifications: 0,
    accountAgeDays: 0,
    monthlyBudgetGoal: 0
  });

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

  // Load 2FA status
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        const response = await apiClient.get2FAStatus();
        if (response.success) {
          setTwoFactorEnabled(response.data.enabled);
        }
      } catch (error) {
        console.error('Failed to load 2FA status:', error);
      }
    };

    load2FAStatus();
  }, []);

  // Load data statistics
  useEffect(() => {
    const loadDataStats = async () => {
      try {
        const response = await apiClient.getDataStats();
        if (response.success) {
          setDataStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load data stats:', error);
      }
    };

    loadDataStats();
  }, []);

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

  // Handle 2FA setup
  const handle2FASetup = async () => {
    setIs2FASetupLoading(true);

    const loadingToast = toast.loading('Setting up 2FA...', {
      description: 'Generating QR code and secret',
    });

    try {
      const response = await apiClient.setup2FA();

      if (response.success) {
        setTwoFactorSecret(response.data.secret);
        setQrCodeUrl(response.data.qrCode);
        setManualEntryKey(response.data.manualEntryKey);
        setIs2FASetupDialogOpen(true);

        toast.dismiss(loadingToast);
        toast.success('2FA setup initiated!', {
          description: 'Scan the QR code with your authenticator app',
          duration: 4000,
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to setup 2FA', {
          description: response.message || 'Please try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('2FA setup error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to setup 2FA', {
        description: error.message || 'Please try again',
        duration: 5000,
      });
    } finally {
      setIs2FASetupLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FAVerification = async () => {
    if (!verificationToken) {
      toast.error('Please enter verification code', {
        description: 'Enter the 6-digit code from your authenticator app',
        duration: 4000,
      });
      return;
    }

    setIs2FAVerifying(true);

    const loadingToast = toast.loading('Verifying 2FA...', {
      description: 'Please wait while we verify your code',
    });

    try {
      const response = await apiClient.verify2FASetup(verificationToken);

      if (response.success) {
        setTwoFactorEnabled(true);
        setIs2FASetupDialogOpen(false);
        setIs2FAVerifyDialogOpen(false);
        setVerificationToken('');

        toast.dismiss(loadingToast);
        toast.success('2FA enabled successfully!', {
          description: 'Your account is now protected with two-factor authentication',
          duration: 5000,
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error('Verification failed', {
          description: response.message || 'Please check your code and try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      toast.dismiss(loadingToast);
      toast.error('Verification failed', {
        description: error.message || 'Please check your code and try again',
        duration: 5000,
      });
    } finally {
      setIs2FAVerifying(false);
    }
  };

  // Handle 2FA disable
  const handle2FADisable = async () => {
    if (!verificationToken) {
      toast.error('Please enter verification code', {
        description: 'Enter the 6-digit code from your authenticator app',
        duration: 4000,
      });
      return;
    }

    setIs2FADisabling(true);

    const loadingToast = toast.loading('Disabling 2FA...', {
      description: 'Please wait while we disable two-factor authentication',
    });

    try {
      const response = await apiClient.disable2FA(verificationToken);

      if (response.success) {
        setTwoFactorEnabled(false);
        setIs2FAVerifyDialogOpen(false);
        setVerificationToken('');

        toast.dismiss(loadingToast);
        toast.success('2FA disabled successfully!', {
          description: 'Your account is no longer protected with two-factor authentication',
          duration: 5000,
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to disable 2FA', {
          description: response.message || 'Please check your code and try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('2FA disable error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to disable 2FA', {
        description: error.message || 'Please check your code and try again',
        duration: 5000,
      });
    } finally {
      setIs2FADisabling(false);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    setIsExportingData(true);

    const loadingToast = toast.loading('Exporting your data...', {
      description: 'Preparing your data for download',
    });

    try {
      const response = await apiClient.exportData();

      if (response.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `moneylens-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.dismiss(loadingToast);
        toast.success('Data exported successfully!', {
          description: 'Your data has been downloaded',
          duration: 4000,
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to export data', {
          description: response.message || 'Please try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Data export error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to export data', {
        description: error.message || 'Please try again',
        duration: 5000,
      });
    } finally {
      setIsExportingData(false);
    }
  };

  // Handle data import
  const handleImportData = async () => {
    if (!importFile) {
      toast.error('Please select a file to import', {
        description: 'Choose a valid JSON export file',
        duration: 4000,
      });
      return;
    }

    setIsImportingData(true);

    const loadingToast = toast.loading('Importing your data...', {
      description: 'Please wait while we process your data',
    });

    try {
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);

      const response = await apiClient.importData(importData);

      if (response.success) {
        setIsImportDialogOpen(false);
        setImportFile(null);

        toast.dismiss(loadingToast);
        toast.success('Data imported successfully!', {
          description: 'Your data has been restored',
          duration: 5000,
        });

        // Refresh data stats
        const statsResponse = await apiClient.getDataStats();
        if (statsResponse.success) {
          setDataStats(statsResponse.data);
        }

        // Refresh page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to import data', {
          description: response.message || 'Please check your file and try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Data import error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to import data', {
        description: error.message || 'Invalid file format. Please use a valid export file.',
        duration: 5000,
      });
    } finally {
      setIsImportingData(false);
    }
  };

  // Handle delete all data
  const handleDeleteAllData = async () => {
    setIsDeletingData(true);

    const loadingToast = toast.loading('Deleting all data...', {
      description: 'This action cannot be undone',
    });

    try {
      const response = await apiClient.deleteAllData();

      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success('All data deleted successfully!', {
          description: 'Your account has been reset',
          duration: 5000,
        });

        // Refresh data stats
        const statsResponse = await apiClient.getDataStats();
        if (statsResponse.success) {
          setDataStats(statsResponse.data);
        }

        // Refresh page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to delete data', {
          description: response.message || 'Please try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Data deletion error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to delete data', {
        description: error.message || 'Please try again',
        duration: 5000,
      });
    } finally {
      setIsDeletingData(false);
    }
  };

  return (
    <motion.div
      className="h-full min-h-screen space-y-6 p-6"
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
            <CardContent className="space-y-6">
              {/* Data Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dataStats.totalTransactions}</div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dataStats.activeCaps}</div>
                  <div className="text-xs text-muted-foreground">Active Caps</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dataStats.totalNotifications}</div>
                  <div className="text-xs text-muted-foreground">Notifications</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dataStats.accountAgeDays}</div>
                  <div className="text-xs text-muted-foreground">Days Old</div>
                </div>
              </div>

              <Separator />

              {/* Export and Import */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleExportData}
                  disabled={isExportingData}
                >
                  <Download className="w-4 h-4" />
                  {isExportingData ? 'Exporting...' : 'Export All Data'}
                </Button>
                
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Import Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import Data</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="importFile" className="text-sm font-medium">
                          Select Export File
                        </Label>
                        <Input
                          id="importFile"
                          type="file"
                          accept=".json"
                          onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Choose a MoneyLens export file (.json)
                        </p>
                      </div>
                      
                      <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <p className="text-sm text-warning font-medium mb-1">⚠️ Warning</p>
                        <p className="text-xs text-muted-foreground">
                          Importing data will replace all your current data. This action cannot be undone.
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={handleImportData}
                          disabled={isImportingData || !importFile}
                          className="flex-1"
                        >
                          {isImportingData ? 'Importing...' : 'Import Data'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsImportDialogOpen(false);
                            setImportFile(null);
                          }}
                          disabled={isImportingData}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Separator />
              
              {/* Danger Zone */}
              <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
                <h4 className="font-semibold text-danger mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center gap-2"
                      disabled={isDeletingData}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeletingData ? 'Deleting...' : 'Delete All Data'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Transactions ({dataStats.totalTransactions})</li>
                          <li>Spending caps ({dataStats.activeCaps})</li>
                          <li>Notifications ({dataStats.totalNotifications})</li>
                          <li>Account preferences and settings</li>
                        </ul>
                        <br />
                        Your account will remain but all data will be reset to default values.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeletingData}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllData}
                        disabled={isDeletingData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingData ? 'Deleting...' : 'Yes, delete all data'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                <div className="grid grid-cols-2 gap-2 mb-4">
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
                
                {/* Custom Color Picker */}
                <div className="mb-4">
                  <ColorPicker
                    value={primaryColor}
                    onChange={(color) => {
                      setPrimaryColor(color);
                      toast.success('Custom color applied!', {
                        description: 'Primary color updated with custom selection',
                        duration: 2000,
                      });
                    }}
                    label="Custom Primary Color"
                  />
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Current: {colorSchemes.find(s => s.primary === primaryColor)?.name || 'Custom Color'}
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
              
              <Dialog open={is2FAVerifyDialogOpen} onOpenChange={setIs2FAVerifyDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIs2FAVerifyDialogOpen(true)}
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="pb-4">
                    <DialogTitle>
                      {twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {!twoFactorEnabled ? (
                      <>
                        <div className="text-center space-y-3">
                          <p className="text-sm font-medium">
                            Ready to secure your account?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Click "Setup 2FA" to generate a QR code for your authenticator app.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handle2FASetup}
                            disabled={is2FASetupLoading}
                            className="flex-1"
                            size="lg"
                          >
                            {is2FASetupLoading ? 'Setting up...' : 'Setup 2FA'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIs2FAVerifyDialogOpen(false)}
                            disabled={is2FASetupLoading}
                            size="lg"
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center space-y-3">
                          <p className="text-sm font-medium text-destructive">
                            ⚠️ Disabling 2FA will reduce your account security
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enter the 6-digit code from your authenticator app to disable 2FA.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="disableToken" className="text-sm font-medium">
                              Verification Code
                            </Label>
                            <Input
                              id="disableToken"
                              type="text"
                              value={verificationToken}
                              onChange={(e) => setVerificationToken(e.target.value)}
                              placeholder="000000"
                              maxLength={6}
                              className="mt-2 text-center text-lg font-mono tracking-widest"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handle2FADisable}
                            disabled={is2FADisabling || !verificationToken}
                            variant="destructive"
                            className="flex-1"
                            size="lg"
                          >
                            {is2FADisabling ? 'Disabling...' : 'Disable 2FA'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIs2FAVerifyDialogOpen(false)}
                            disabled={is2FADisabling}
                            size="lg"
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={is2FASetupDialogOpen} onOpenChange={setIs2FASetupDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader className="pb-4">
                    <DialogTitle>Complete 2FA Setup</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* QR Code Section */}
                    <div className="text-center space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Scan this QR code with your authenticator app:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Use Google Authenticator, Authy, or any TOTP-compatible app
                        </p>
                      </div>
                      
                      {qrCodeUrl && (
                        <div className="flex justify-center p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
                          <img 
                            src={qrCodeUrl} 
                            alt="2FA QR Code" 
                            className="w-40 h-40 rounded-lg shadow-sm" 
                          />
                        </div>
                      )}
                    </div>

                    {/* Manual Entry Section */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2">
                          Can't scan the QR code?
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Enter this key manually in your authenticator app:
                        </p>
                        <div className="bg-muted p-3 rounded-lg border">
                          <code className="text-sm font-mono break-all text-foreground">
                            {manualEntryKey}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Verification Section */}
                    <div className="space-y-3">
                      <Separator />
                      <div>
                        <Label htmlFor="verifyToken" className="text-sm font-medium">
                          Verification Code
                        </Label>
                        <Input
                          id="verifyToken"
                          type="text"
                          value={verificationToken}
                          onChange={(e) => setVerificationToken(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          className="mt-2 text-center text-lg font-mono tracking-widest"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handle2FAVerification}
                        disabled={is2FAVerifying || !verificationToken}
                        className="flex-1"
                        size="lg"
                      >
                        {is2FAVerifying ? 'Verifying...' : 'Verify & Enable 2FA'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIs2FASetupDialogOpen(false);
                          setVerificationToken('');
                        }}
                        disabled={is2FAVerifying}
                        size="lg"
                      >
                        Cancel
              </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Separator />
              
              <div className="text-center space-y-2">
                <Badge variant={twoFactorEnabled ? "default" : "secondary"} className="text-xs">
                  {twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                </Badge>
                <div>
                <Badge variant="secondary" className="text-xs">
                  Last login: 2 hours ago
                </Badge>
                </div>
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
                <span className="font-semibold">{dataStats.totalTransactions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Caps</span>
                <span className="font-semibold">{dataStats.activeCaps}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Account Age</span>
                <span className="font-semibold">{dataStats.accountAgeDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Budget</span>
                <span className="font-semibold">${dataStats.monthlyBudgetGoal}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}