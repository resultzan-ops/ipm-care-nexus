import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, RotateCcw, Shield, Database, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_SYSTEM_CONFIG, SystemConfig, isValidSystemConfig } from "@/lib/super-admin-config";

export function SystemConfigManager() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = async () => {
    if (!isValidSystemConfig(config)) {
      toast({
        title: "Invalid Configuration",
        description: "Please check your configuration values and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In real app, save to Supabase system_config table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      toast({
        title: "Configuration Saved",
        description: "System configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save system configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    setConfig(DEFAULT_SYSTEM_CONFIG);
    toast({
      title: "Reset to Defaults",
      description: "Configuration has been reset to default values.",
    });
  };

  const updateConfig = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Configuration</h2>
          <p className="text-muted-foreground">Manage global system settings and parameters</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveConfig} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User & Company Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>User & Company Limits</span>
            </CardTitle>
            <CardDescription>
              Set maximum limits for users and companies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max-users">Maximum Users per Company</Label>
              <Input
                id="max-users"
                type="number"
                value={config.max_users_per_company}
                onChange={(e) => updateConfig('max_users_per_company', parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum number of users allowed per company
              </p>
            </div>
            <div>
              <Label htmlFor="max-equipment">Maximum Equipment per Company</Label>
              <Input
                id="max-equipment"
                type="number"
                value={config.max_equipment_per_company}
                onChange={(e) => updateConfig('max_equipment_per_company', parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum number of equipment items per company
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>
              Configure security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session-timeout">Default Session Timeout (hours)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={config.default_session_timeout}
                onChange={(e) => updateConfig('default_session_timeout', parseInt(e.target.value) || 1)}
                min="1"
                max="24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default session timeout for all users
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-2fa">Require 2FA for Admins</Label>
                <p className="text-xs text-muted-foreground">
                  Force two-factor authentication for admin users
                </p>
              </div>
              <Switch
                id="require-2fa"
                checked={config.require_2fa_for_admins}
                onCheckedChange={(checked) => updateConfig('require_2fa_for_admins', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>System Maintenance</span>
            </CardTitle>
            <CardDescription>
              Configure backup and maintenance schedules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
              <Input
                id="backup-frequency"
                type="number"
                value={config.backup_frequency_hours}
                onChange={(e) => updateConfig('backup_frequency_hours', parseInt(e.target.value) || 1)}
                min="1"
                max="168"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How often to perform system backups
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenance-start">Maintenance Window Start</Label>
                <Input
                  id="maintenance-start"
                  type="time"
                  value={config.maintenance_window_start}
                  onChange={(e) => updateConfig('maintenance_window_start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maintenance-end">Maintenance Window End</Label>
                <Input
                  id="maintenance-end"
                  type="time"
                  value={config.maintenance_window_end}
                  onChange={(e) => updateConfig('maintenance_window_end', e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Daily maintenance window when system updates can occur
            </p>
          </CardContent>
        </Card>

        {/* File Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>File Upload Settings</span>
            </CardTitle>
            <CardDescription>
              Configure file upload restrictions and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={config.max_file_size_mb}
                onChange={(e) => updateConfig('max_file_size_mb', parseInt(e.target.value) || 1)}
                min="1"
                max="100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size allowed for uploads
              </p>
            </div>
            <div>
              <Label>Allowed File Types</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.allowed_file_types.map((type, index) => (
                  <Badge key={index} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                File types allowed for upload (certificates, documents, images)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Configuration Summary</span>
          </CardTitle>
          <CardDescription>
            Overview of current system configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{config.max_users_per_company}</div>
              <div className="text-sm text-muted-foreground">Max Users/Company</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{config.max_equipment_per_company}</div>
              <div className="text-sm text-muted-foreground">Max Equipment/Company</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{config.default_session_timeout}h</div>
              <div className="text-sm text-muted-foreground">Session Timeout</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{config.max_file_size_mb}MB</div>
              <div className="text-sm text-muted-foreground">Max File Size</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}