import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Optional import for expo-notifications
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  // Configure notification behavior if available
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (error) {
  console.warn('expo-notifications not available, notifications will be disabled');
}

export interface NotificationData {
  type: 'subscription_update' | 'payment_success' | 'payment_failed' | 'signal_alert' | 'general';
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (!Notifications) {
      console.warn('Notifications not available, skipping initialization');
      return;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return;
      }

      // Get push token
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });
      
      this.pushToken = tokenData.data;
      await this.savePushToken(this.pushToken);
      
      console.log('Push token:', this.pushToken);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('pushToken', token);
      // TODO: Send token to your backend
      // await api.updatePushToken(token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  async scheduleLocalNotification(notification: NotificationData, delay: number = 0): Promise<string> {
    if (!Notifications) {
      console.warn('Notifications not available, skipping local notification');
      return 'mock-notification-id';
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });

      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    if (!Notifications) {
      console.warn('Notifications not available, skipping cancel notification');
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (!Notifications) {
      console.warn('Notifications not available, skipping cancel all notifications');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Handle subscription update notifications
  async notifySubscriptionUpdate(type: 'activated' | 'expired' | 'cancelled', planName: string): Promise<void> {
    const messages = {
      activated: `Your ${planName} subscription is now active!`,
      expired: `Your ${planName} subscription has expired.`,
      cancelled: `Your ${planName} subscription has been cancelled.`,
    };

    await this.scheduleLocalNotification({
      type: 'subscription_update',
      title: 'Subscription Update',
      body: messages[type],
      data: { planName, updateType: type },
    });
  }

  // Handle payment notifications
  async notifyPaymentStatus(success: boolean, amount?: string, planName?: string): Promise<void> {
    const notification: NotificationData = success
      ? {
          type: 'payment_success',
          title: 'Payment Successful',
          body: `Your payment${amount ? ` of ${amount}` : ''} was processed successfully.${planName ? ` Welcome to ${planName}!` : ''}`,
          data: { amount, planName },
        }
      : {
          type: 'payment_failed',
          title: 'Payment Failed',
          body: 'Your payment could not be processed. Please try again or contact support.',
          data: { amount, planName },
        };

    await this.scheduleLocalNotification(notification);
  }

  // Handle signal alerts
  async notifySignalAlert(signalType: string, asset: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'signal_alert',
      title: 'New Trading Signal',
      body: `New ${signalType} signal available for ${asset}`,
      data: { signalType, asset },
    });
  }

  // Get notification history
  async getNotificationHistory(): Promise<any[]> {
    if (!Notifications) {
      console.warn('Notifications not available, returning empty history');
      return [];
    }

    try {
      return await Notifications.getPresentedNotificationsAsync();
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  // Set up notification listeners
  setupNotificationListeners(): {
    responseListener: any;
    notificationListener: any;
  } | null {
    if (!Notifications) {
      console.warn('Notifications not available, skipping listener setup');
      return null;
    }

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Handle notification received while app is in foreground
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap
      const { type, data } = response.notification.request.content.data as any;
      
      switch (type) {
        case 'subscription_update':
          // Navigate to subscription screen
          break;
        case 'payment_success':
        case 'payment_failed':
          // Navigate to payment history
          break;
        case 'signal_alert':
          // Navigate to signals screen
          break;
        default:
          // Handle general notifications
          break;
      }
    });

    return { responseListener, notificationListener };
  }

  // Clean up listeners
  removeNotificationListeners(listeners: {
    responseListener: any;
    notificationListener: any;
  } | null): void {
    if (!listeners) {
      return;
    }
    
    try {
      listeners.notificationListener?.remove();
      listeners.responseListener?.remove();
    } catch (error) {
      console.error('Failed to remove notification listeners:', error);
    }
  }

  getPushToken(): string | null {
    return this.pushToken;
  }
}