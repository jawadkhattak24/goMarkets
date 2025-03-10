import { createContext, ReactNode, useContext, useState } from "react";

type NotificationType = "success" | "error" | "loading";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  showNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  removeNotification: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const showNotification = (message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      message,
      type,
    };

    setNotifications((prev) => [...prev, newNotification]);

    if (type !== "loading") {
      setTimeout(() => {
        removeNotification(id);
      }, 2000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
