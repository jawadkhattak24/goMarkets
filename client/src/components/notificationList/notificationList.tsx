import { useNotification } from "../../contexts/notificationContext";
import styles from "./styles/notificationList.module.scss";

export const NotificationList = () => {
  const { notifications } = useNotification();

  return (
    <div className={styles.notificationList}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.notification} ${styles[notification.type]}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};
