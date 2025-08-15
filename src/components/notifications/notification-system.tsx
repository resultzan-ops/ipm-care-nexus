import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, MessageSquare, Calendar, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationData {
  id: string;
  type: 'calibration_due' | 'maintenance_due' | 'equipment_alert';
  equipmentId: string;
  equipmentName: string;
  message: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: {
    admins: string[];
    owners: string[];
  };
}

export function NotificationSystem() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Mock notification data - in real app this would come from backend
  const mockNotifications: NotificationData[] = [
    {
      id: "1",
      type: "calibration_due",
      equipmentId: "EQ-003",
      equipmentName: "X-Ray Siemens",
      message: "Calibration certificate expires in 7 days",
      dueDate: "2024-03-20",
      priority: "high",
      recipients: {
        admins: ["admin@hospital.com"],
        owners: ["owner@hospital.com"]
      }
    },
    {
      id: "2", 
      type: "calibration_due",
      equipmentId: "EQ-004",
      equipmentName: "CT Scanner Toshiba",
      message: "Calibration certificate has expired",
      dueDate: "2023-11-15",
      priority: "critical",
      recipients: {
        admins: ["admin@hospital.com"],
        owners: ["owner@hospital.com"]
      }
    }
  ];

  useEffect(() => {
    // Simulate checking for notifications on component mount
    const checkNotifications = () => {
      setNotifications(mockNotifications);
      
      // Show toast notifications for critical items
      mockNotifications.forEach(notification => {
        if (notification.priority === 'critical') {
          toast({
            title: "Critical Alert",
            description: `${notification.equipmentName}: ${notification.message}`,
            variant: "destructive",
          });
        } else if (notification.priority === 'high') {
          toast({
            title: "Calibration Alert",
            description: `${notification.equipmentName}: ${notification.message}`,
          });
        }
      });
    };

    // Check notifications immediately and then every 5 minutes
    checkNotifications();
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [toast]);

  // Simulate sending email notification
  const sendEmailNotification = async (notification: NotificationData) => {
    console.log("Sending email notification:", {
      to: [...notification.recipients.admins, ...notification.recipients.owners],
      subject: `Equipment Alert: ${notification.equipmentName}`,
      message: notification.message,
      priority: notification.priority
    });
    
    toast({
      title: "Email Sent",
      description: `Notification sent to ${notification.recipients.admins.length + notification.recipients.owners.length} recipients`,
    });
  };

  // Simulate sending WhatsApp notification
  const sendWhatsAppNotification = async (notification: NotificationData) => {
    console.log("Sending WhatsApp notification:", {
      message: `🏥 *RS Umum Daerah Bantul*\n\n⚕️ Equipment Alert\n📋 ${notification.equipmentName}\n📅 Due: ${notification.dueDate}\n\n${notification.message}\n\nPlease take necessary action.`,
      priority: notification.priority
    });
    
    toast({
      title: "WhatsApp Sent",
      description: `WhatsApp notification sent for ${notification.equipmentName}`,
    });
  };

  // Auto-send notifications for critical and high priority items
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.priority === 'critical' || notification.priority === 'high') {
        // In a real app, you would check if notification was already sent
        // For demo purposes, we'll just log the actions
        setTimeout(() => {
          sendEmailNotification(notification);
        }, 2000);
        
        setTimeout(() => {
          sendWhatsAppNotification(notification);
        }, 4000);
      }
    });
  }, [notifications]);

  return null; // This is a background service component
}

// Hook to manually trigger notifications
export function useNotifications() {
  const { toast } = useToast();

  const sendCalibrationReminder = (equipmentName: string, daysUntilDue: number) => {
    const message = daysUntilDue <= 0 
      ? `${equipmentName} calibration has expired!`
      : `${equipmentName} calibration due in ${daysUntilDue} days`;
    
    toast({
      title: daysUntilDue <= 0 ? "Calibration Expired" : "Calibration Due Soon",
      description: message,
      variant: daysUntilDue <= 0 ? "destructive" : "default",
    });
  };

  const sendMaintenanceReminder = (equipmentName: string, maintenanceType: string) => {
    toast({
      title: "Maintenance Required",
      description: `${equipmentName} requires ${maintenanceType}`,
    });
  };

  const sendEquipmentAlert = (equipmentName: string, alertMessage: string) => {
    toast({
      title: "Equipment Alert",
      description: `${equipmentName}: ${alertMessage}`,
      variant: "destructive",
    });
  };

  return {
    sendCalibrationReminder,
    sendMaintenanceReminder,
    sendEquipmentAlert
  };
}