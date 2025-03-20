import "./App.css";

import TradingPortal from "./components/tradingPortal/tradingPortal";
import { AuthProvider } from "./contexts/authContext";
import { NotificationProvider } from "./contexts/notificationContext";
import { NotificationList } from "./components/notificationList/notificationList";

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TradingPortal />
        <NotificationList />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;