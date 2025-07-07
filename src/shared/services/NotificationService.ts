/**
 * Service de notification utilisateur
 */

import { BaseService } from './BaseService';
import { Notification } from '../../core/types';

export class NotificationService extends BaseService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  private constructor() {
    super('NotificationService');
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    this.log('Initializing notification service');
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up notification service');
    this.notifications = [];
    this.listeners = [];
    this.isInitialized = false;
  }

  show(notification: Omit<Notification, 'id'>): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };

    this.notifications.push(fullNotification);
    this.notifyListeners();

    // Auto-remove après duration
    if (fullNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, fullNotification.duration);
    }

    return id;
  }

  success(title: string, message: string, duration?: number): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration?: number): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: duration ?? 0 // Les erreurs restent jusqu'à fermeture manuelle
    });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration?: number): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Retourne une fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        this.log('Error notifying listener', 'error');
      }
    });
  }
}