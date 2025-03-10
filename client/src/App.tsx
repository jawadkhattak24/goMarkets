import { useEffect, useRef, useState } from "react";
import { KLineChartPro, SymbolInfo, Period } from "@sohail2001/klinecharts-pro";
import Register from "./components/authentication/register/register";
import Login from "./components/authentication/login/login";
import WatchList from "./components/watchList/watchList";
import "./App.css";
import OrderPanel from "./components/orderPanel/orderPanel";
import UserPanel from "./components/UserPanel/userPanel";
import PositionHoldingHistory from "./components/positionHoldingHistory/positionHoldingHistory";
import { NotificationList } from "./components/notificationList/notificationList";
import { NotificationProvider } from "./contexts/notificationContext";
import ForgotPassword from "./components/authentication/forgotPassword/forgotPassword";
import { AuthProvider, useAuth } from "./contexts/authContext";

const AppContent = () => {
  const { isLoggedIn, currentUser } = useAuth();

  console.log("CurrentUser", isLoggedIn, " ", currentUser);
  const chartRef = useRef<KLineChartPro | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState("XAUUSD");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  console.log("Current symbol: ", currentSymbol);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [selectedPairPrice, setSelectedPairPrice] = useState(0);

  const handleSymbolChange = (symbol: string, pricePrecision: number) => {
    setCurrentSymbol(symbol);
    if (chartRef.current) {
      chartRef.current.setSymbol({
        exchange: "XNYS",
        market: "stocks",
        name: symbol || "BTCUSD",
        shortName: symbol || "BTCUSD",
        ticker: symbol || "BTCUSD",
        priceCurrency: "usd",
        type: "ADRC",
        logo: pricePrecision.toString() || "106",
      });
    }
  };

  const isChartInitialized = useRef(false);

  useEffect(() => {
    const locale = "en-US";

    const options = {
      container: "chart-container",
      locale,
      watermark: "",
      symbol: {
        exchange: "XNYS",
        market: "stocks",
        name: currentSymbol,
        shortName: currentSymbol,
        ticker: currentSymbol,
        priceCurrency: "usd",
        type: "ADRC",
        pricePrecision: 0,
      },
      period: { multiplier: 15, timespan: "minute", text: "15m" },
      subIndicators: [""],
      datafeed: new CustomDatafeed(),
    };

    if (!isChartInitialized.current) {
      // @ts-expect-error - KLineChartPro works correctly at runtime despite type issues
      chartRef.current = new KLineChartPro(options);
      isChartInitialized.current = true;
      console.log("Chart initialized");
    }
  }, [currentSymbol]);

  return (
    <div className="flexContainer">
      <div className="watchListContainer">
        <WatchList
          setSelectedPairPrice={setSelectedPairPrice}
          onSymbolSelect={handleSymbolChange}
        />
      </div>
      <div className="chart-container" id="chart-container" />
      <div className="orderPanelContainer">
        <OrderPanel
          symbol={currentSymbol}
          isRegisterOpen={isRegisterOpen}
          setIsRegisterOpen={setIsRegisterOpen}
          isLoginOpen={isLoginOpen}
          setIsLoginOpen={setIsLoginOpen}
          isUserPanelOpen={isUserPanelOpen}
          setIsUserPanelOpen={setIsUserPanelOpen}
          selectedPairPrice={selectedPairPrice}
        />
      </div>
      <div className="registerContainer">
        {isRegisterOpen && (
          <Register
            setIsRegisterOpen={setIsRegisterOpen}
            setIsLoginOpen={setIsLoginOpen}
          />
        )}
        {isLoginOpen && (
          <Login       
            setIsRegisterOpen={setIsRegisterOpen}
            setIsLoginOpen={setIsLoginOpen}
            setIsForgotPasswordOpen={setIsForgotPasswordOpen}
          />
        )}
        {isForgotPasswordOpen && (
          <ForgotPassword setIsForgotPasswordOpen={setIsForgotPasswordOpen} />
        )}
        {isUserPanelOpen && (
          <UserPanel setIsUserPanelOpen={setIsUserPanelOpen} />
        )}
      </div>

      {currentUser && (
        <div className="flexRow positionHoldingHistoryContainer">
          <PositionHoldingHistory />
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        <NotificationList />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

interface KLineData {
  Time: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Amount: number;
}

class CustomDatafeed {
  private baseUrl = "https://api.gomktsglb.cc/v1/api";

  private periodMap: Record<string, string> = {
    minute: "min",
    hour: "hour",
    day: "day",
    week: "week",
    month: "month",
  };

  async searchSymbols(): Promise<SymbolInfo[]> {
    return [
      {
        ticker: "XAUUSD",
        name: "Gold/USD",
        shortName: "XAUUSD",
        market: "forex",
        exchange: "FOREX",
        priceCurrency: "USD",
        type: "forex",
      },
    ];
  }

  async getHistoryKLineData(
    symbol: SymbolInfo,
    period: Period,
    from: number,
    to: number
  ): Promise<KLineData[]> {
    try {
      const periodStr = `${period.multiplier}${
        this.periodMap[period.timespan]
      }`;
      const url = `${this.baseUrl}/forex/kline?forex_id=${
        symbol.logo
      }&period=${periodStr}&from=${from}&to=${to}&t=${Date.now()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 1) {
        throw new Error(data.msg || "Failed to fetch data");
      }

      return data.data.map((item: KLineData) => ({
        timestamp: item.Time,
        open: item.Open,
        high: item.High,
        low: item.Low,
        close: item.Close,
        volume: item.Volume,
        turnover: item.Amount,
      }));
    } catch (error) {
      console.error("Error fetching kline data:", error);
      return [];
    }
  }

  subscribe(): void {}

  unsubscribe(): void {}
}
