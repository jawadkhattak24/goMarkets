import { useEffect, useRef, useState } from "react";
import { KLineChartPro, SymbolInfo, Period, DatafeedSubscribeCallback } from "@sohail2001/klinecharts-pro";
import Register from "../authentication/register/register";
import Login from "../authentication/login/login";
import WatchList from "../watchList/watchList";
import OrderPanel from "../orderPanel/orderPanel";
import styles from "./styles/tradingPortal.module.scss";
import UserPanel from "../UserPanel/userPanel";
import PositionHoldingHistory from "../positionHoldingHistory/positionHoldingHistory";
import ForgotPassword from "../authentication/forgotPassword/forgotPassword";
import { useAuth } from "../../contexts/authContext";
import ForexLiveData from "./streamingTest";

const TradingPortal = () => {
    const { isLoggedIn, currentUser } = useAuth();

    console.log("CurrentUser", isLoggedIn, " ", currentUser);
    const chartRef = useRef<KLineChartPro | null>(null);
    const [currentSymbol, setCurrentSymbol] = useState("XAUUSD");
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
    const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
    console.log("Current symbol: ", currentSymbol);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [selectedPairPrice, setSelectedPairPrice] = useState(0);


    // const [isInitialRender, setIsInitialRender] = useState("");



    // useEffect(() => {
    //     setIsInitialRender("inr");
    //     console.log("Initial Render", isInitialRender);
    // }, []);


    const handleSymbolChange = (symbol: string, pricePrecision: number) => {
        setCurrentSymbol(symbol);
        if (chartRef.current) {
            chartRef.current.setSymbol({
                exchange: "XNYS",
                market: "stocks",
                name: "XAUUSD",
                shortName: "XAUUSD",
                ticker: "XAUUSD",
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
                name: "XAUUSD",
                shortName: "XAUUSD",
                ticker: "XAUUSD",
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
        <div className={styles.flexContainer}>
            <div className={styles.watchListContainer}>
                <WatchList
                    setSelectedPairPrice={setSelectedPairPrice}
                    onSymbolSelect={handleSymbolChange}
                />
            </div>
            <div className={styles.chartContainer} id="chart-container" />
            <div className={styles.orderPanelContainer}>
                <OrderPanel
                    symbol={currentSymbol}
                    isRegisterOpen={isRegisterOpen}
                    setIsRegisterOpen={setIsRegisterOpen}
                    isLoginOpen={isLoginOpen}
                    setIsLoginOpen={setIsLoginOpen}
                    isUserPanelOpen={isUserPanelOpen}
                    setIsUserPanelOpen={setIsUserPanelOpen}
                    selectedPairPrice={selectedPairPrice}
                    setIsOrderSubmitted={setIsOrderSubmitted}
                />
            </div>
            <div className={styles.registerContainer}>
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
                <div className={styles.flexRow}>
                    <PositionHoldingHistory isOrderSubmitted={isOrderSubmitted} />
                </div>
            )}

            {/* <ForexLiveData /> */}
        </div>
    );
};



export default TradingPortal;

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
    private _ws: WebSocket | null = null;
    private _prevSymbolMarket: string | null = null;

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
            const periodStr = `${period.multiplier}${this.periodMap[period.timespan]
                }`;
            const url = `${this.baseUrl}/forex/kline?forex_id=${symbol.priceCurrency === "inr" ? 106 : symbol.logo}&period=${periodStr}&from=${from}&to=${to}&t=${Date.now()}`;

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

    subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void {
        let lastProcessedTime = 0;

        const setupWebSocket = () => {
            try {
                console.log('Setting up WebSocket connection...');

                if (this._ws) {
                    console.log('Closing existing WebSocket connection...');
                    this._ws.close();
                    this._ws = null;
                }

                // this._ws = new WebSocket('wss://api.gomktsglb.cc/v1/ws');
                // this._ws = new WebSocket('ws://localhost:3000/ws');
                this._ws = new WebSocket('wss://api.spreedex.cc/v1/ws');

                // Add connection state logging
                console.log('WebSocket current state:', this._ws.readyState);

                this._ws.onopen = () => {
                    console.log('WebSocket connected for live data from subscribe, readyState:', this._ws?.readyState);
                };

                this._ws.onmessage = (event) => {
                    console.log('Received message, readyState:', this._ws?.readyState);
                    const result = JSON.parse(event.data);

                    console.log("Data from server", result);

                    if (result && result.code === 1 && Array.isArray(result.data)) {
                        const newData = result.data
                            .filter((item: KLineData) => item.Time > lastProcessedTime)
                            .sort((a: KLineData, b: KLineData) => a.Time - b.Time);

                        if (newData.length > 0) {
                            lastProcessedTime = newData[newData.length - 1].Time;
                            const latestPoint = newData[newData.length - 1];
                            callback({
                                timestamp: latestPoint.Time,
                                open: latestPoint.Open,
                                high: latestPoint.High,
                                low: latestPoint.Low,
                                close: latestPoint.Close,
                                volume: latestPoint.Volume,
                                turnover: latestPoint.Amount
                            });
                        }
                    }
                };

                this._ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    console.error('WebSocket error state:', this._ws?.readyState);
                };

                this._ws.onclose = (event) => {
                    console.log('WebSocket disconnected', {
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean,
                        readyState: this._ws?.readyState
                    });
                };

            } catch (error) {
                console.error('Error setting up WebSocket:', error);
            }
        };

        // Only set up new WebSocket if we're changing markets or don't have a connection
        if (this._prevSymbolMarket !== symbol.market || !this._ws || this._ws.readyState !== WebSocket.OPEN) {
            setupWebSocket();
        }

        this._prevSymbolMarket = symbol.market || null;
    }

    unsubscribe(): void {
        if (this._ws) {
            this._ws.close();
            this._ws = null;
        }
        this._prevSymbolMarket = null;
        console.log("Unsubscribed from the chart");
    }
}
