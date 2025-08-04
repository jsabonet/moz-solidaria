// src/hooks/use-notification.ts
import { toast } from 'sonner';

interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const useNotification = () => {
  const success = (title: string, options?: NotificationOptions) => {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  };

  const error = (title: string, options?: NotificationOptions) => {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  };

  const info = (title: string, options?: NotificationOptions) => {
    toast.info(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  };

  const warning = (title: string, options?: NotificationOptions) => {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  };

  return {
    success,
    error,
    info,
    warning,
  };
};

export default useNotification;