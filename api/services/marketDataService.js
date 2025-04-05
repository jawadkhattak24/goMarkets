const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MarketDataService {
    constructor() {
        this.dataCache = new Map();
        this.currentIndex = new Map(); // Track current streaming position for each symbol
    }

    generateHourData(baseValue) {
        const SECONDS_IN_HOUR = 3600; // 60 * 60
        const date = new Date();
        date.setSeconds(0);
        date.setMilliseconds(0);

        const candles = [];
        let currentPrice = baseValue;
        const volatility = baseValue * 0.001;

        const generateNextPrice = (prevPrice) => {
            const drift = prevPrice * 0.0001 * (Math.random() - 0.5);
            const randomComponent = volatility * (Math.random() - 0.5);
            return prevPrice + drift + randomComponent;
        };

        // Generate one candle per second for an hour
        for (let i = 0; i < SECONDS_IN_HOUR; i++) {
            const newPrice = generateNextPrice(currentPrice);
            
            const candle = {
                time: new Date(date),
                open: currentPrice,
                high: Math.max(currentPrice, newPrice),
                low: Math.min(currentPrice, newPrice),
                close: newPrice,
                volume: Math.floor(Math.random() * 100) + 50 // Smaller volume for per-second data
            };

            candles.push(candle);
            currentPrice = newPrice;
            date.setSeconds(date.getSeconds() + 1);
        }

        return candles;
    }

    async storeMarketData(symbol, candles) {
        try {
            // First, clear existing data for the symbol
            await prisma.marketData.deleteMany({
                where: { symbol }
            });

            // Store new data in batches
            const batchSize = 100;
            for (let i = 0; i < candles.length; i += batchSize) {
                const batch = candles.slice(i, i + batchSize);
                await prisma.marketData.createMany({
                    data: batch.map(candle => ({
                        symbol,
                        time: candle.time,
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                        volume: candle.volume
                    }))
                });
            }

            // Update cache and reset index
            this.dataCache.set(symbol, candles);
            this.currentIndex.set(symbol, 0);
            
            console.log(`Stored ${candles.length} candles for ${symbol}`);
        } catch (error) {
            console.error(`Error storing market data for ${symbol}:`, error);
            throw error;
        }
    }

    async getNextCandle(symbol) {
        try {
            const candles = this.dataCache.get(symbol);
            if (!candles) {
                throw new Error(`No data available for ${symbol}`);
            }

            let index = this.currentIndex.get(symbol) || 0;
            
            // If we've reached the end, regenerate and store new data
            if (index >= candles.length) {
                const basePrice = candles[candles.length - 1].close;
                const newCandles = this.generateHourData(basePrice);
                await this.storeMarketData(symbol, newCandles);
                index = 0;
            }

            const candle = candles[index];
            this.currentIndex.set(symbol, index + 1);
            
            return {
                time: Math.floor(candle.time.getTime() / 1000),
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            };
        } catch (error) {
            console.error(`Error getting next candle for ${symbol}:`, error);
            throw error;
        }
    }

    async initializeSymbol(symbol, basePrice) {
        try {
            const candles = this.generateHourData(basePrice);
            await this.storeMarketData(symbol, candles);
            return candles;
        } catch (error) {
            console.error(`Error initializing ${symbol}:`, error);
            throw error;
        }
    }

    async getAllCandles(symbol) {
        try {
            if (this.dataCache.has(symbol)) {
                return this.dataCache.get(symbol).map(candle => ({
                    time: Math.floor(candle.time.getTime() / 1000),
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                    volume: candle.volume
                }));
            }

            const data = await prisma.marketData.findMany({
                where: { symbol },
                orderBy: { time: 'asc' }
            });

            this.dataCache.set(symbol, data);
            this.currentIndex.set(symbol, 0);
            
            return data.map(candle => ({
                time: Math.floor(candle.time.getTime() / 1000),
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            }));
        } catch (error) {
            console.error(`Error fetching all candles for ${symbol}:`, error);
            throw error;
        }
    }
}

module.exports = new MarketDataService(); 




// import { createChart, ColorType, CandlestickSeries, Time, IChartApi, ISeriesApi } from 'lightweight-charts';
// import { useEffect, useRef, useState, useContext } from 'react';
// import styles from './styles/klineChart.module.scss';
// import SidebarWatchList from '../sidebarWatchList/sidebarWatchList';
// import TradeContext from '../../context/tradeContext';
// import { BsFillTriangleFill } from "react-icons/bs";

// interface CandlestickData {
//     time: Time;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
// }

// interface KLineChartProps {
//     currentPrice: number;
//     setCurrentPrice: (price: number) => void;
//     selectedPair: {
//         symbol: string;
//         price: number;
//     };
// }

// export const KLineChart = ({ currentPrice, setCurrentPrice, selectedPair }: KLineChartProps) => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const { selectedPair: contextSelectedPair } = useContext(TradeContext);
//     const wsRef = useRef<WebSocket | null>(null);

//     // Use the pair from context if available
//     const activePair = contextSelectedPair.symbol ? contextSelectedPair : selectedPair;
    
//     useEffect(() => {
//         console.log("KLineChart: activePair changed", activePair);
//         setCurrentPrice(activePair.price);
//     }, [activePair, setCurrentPrice]);

//     const colors = {
//         backgroundColor: 'white',
//         lineColor: '#2962FF',
//         textColor: 'black',
//         upColor: '#0166fc',
//         downColor: '#f23c48',
//     };

//     const chartContainerRef = useRef<HTMLDivElement>(null);
//     const chartRef = useRef<IChartApi | null>(null);
//     const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
//     const [dimensions, setDimensions] = useState({
//         width: window.innerWidth,
//         height: window.innerHeight * 0.3
//     });

//     useEffect(() => {
//         if (!chartContainerRef.current) return;

//         const handleResize = () => {
//             setDimensions({
//                 width: window.innerWidth,
//                 height: window.innerHeight * 0.3
//             });

//             if (chartRef.current) {
//                 chartRef.current.applyOptions({
//                     width: window.innerWidth,
//                     height: window.innerHeight * 0.3
//                 });
//             }
//         };

//         // Create chart
//         const chart = createChart(chartContainerRef.current, {
//             layout: {
//                 background: { type: ColorType.Solid, color: colors.backgroundColor },
//                 textColor: colors.textColor,
//                 fontSize: 12,
//             },
//             width: dimensions.width,
//             height: dimensions.height,
//             grid: {
//                 vertLines: { visible: true, color: 'rgba(240, 243, 250, 0.8)' },
//                 horzLines: { visible: true, color: 'rgba(240, 243, 250, 0.8)' }
//             },
//             crosshair: {
//                 vertLine: {
//                     width: 4,
//                     color: 'rgba(224, 227, 235, 0.1)',
//                     style: 1,
//                 },
//                 horzLine: {
//                     visible: true,
//                     labelVisible: true,
//                 },
//             },
//             rightPriceScale: {
//                 borderVisible: false,
//                 scaleMargins: {
//                     top: 0.1,
//                     bottom: 0.1,
//                 },
//             },
//             timeScale: {
//                 borderVisible: false,
//                 timeVisible: true,
//                 secondsVisible: false,
//                 tickMarkFormatter: (time: number) => {
//                     const date = new Date(time * 1000);
//                     return date.getHours().toString().padStart(2, '0') + ':' +
//                         date.getMinutes().toString().padStart(2, '0');
//                 },
//             },
//             handleScroll: {
//                 mouseWheel: false,
//                 pressedMouseMove: true,
//                 horzTouchDrag: true,
//                 vertTouchDrag: true
//             },
//             handleScale: {
//                 axisPressedMouseMove: false,
//                 mouseWheel: false,
//                 pinch: true,
//             },
//         });

//         chartRef.current = chart;

//         const candlestickSeries = chart.addSeries(CandlestickSeries, {
//             upColor: colors.upColor,
//             wickUpColor: colors.upColor,
//             downColor: colors.downColor,
//             wickDownColor: colors.downColor,
//             borderVisible: false,
//             priceLineVisible: true,
//             priceLineWidth: 1,
//             priceLineColor: colors.lineColor,
//         });

//         candlestickSeriesRef.current = candlestickSeries;

//         // Connect to WebSocket
//         const ws = new WebSocket('ws://192.168.100.8:3000/ws'); // Update with your backend URL
//         wsRef.current = ws;

//         ws.onmessage = (event) => {
//             const message = JSON.parse(event.data);
            
//             if (message.type === 'initial') {
//                 candlestickSeries.setData(message.data);
//                 if (message.data.length > 0) {
//                     setCurrentPrice(message.data[message.data.length - 1].close);
//                 }
//                 chart.timeScale().fitContent();
//                 chart.timeScale().scrollToPosition(-20, false);
//             } else if (message.type === 'update') {
//                 candlestickSeries.update(message.data);
//                 setCurrentPrice(message.data.close);
//                 chart.timeScale().scrollToRealTime();
//             }
//         };

//         ws.onerror = (error) => {
//             console.error('WebSocket error:', error);
//         };

//         ws.onclose = () => {
//             console.log('WebSocket connection closed');
//         };

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//             if (wsRef.current) {
//                 wsRef.current.close();
//             }
//             if (chartRef.current) {
//                 chartRef.current.remove();
//             }
//         };
//     }, [dimensions.width, dimensions.height, setCurrentPrice, activePair.symbol]);

//     return (
//         <div className={styles.chartWrapper}>
//             {isSidebarOpen &&
//                 <>
//                     <div
//                         className={`${styles.overlay} ${isSidebarOpen ? styles.open : ''}`}
//                         onClick={() => setIsSidebarOpen(false)}
//                     />
//                     <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
//                         <SidebarWatchList
//                             onSymbolSelect={(symbol) => {
//                                 console.log("KLineChart: Symbol selected from sidebar:", symbol);
//                                 setIsSidebarOpen(false);
//                             }}
//                             setIsSidebarOpen={setIsSidebarOpen}
//                             setSelectedPairPrice={setCurrentPrice}
//                         />
//                     </div>
//                 </>
//             }
//             <div className={styles.symbolInfoContainer}>
//                 <p
//                     className={styles.symbolName}
//                     onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//                 >
//                     {activePair.symbol ? activePair.symbol : ""}
//                     <BsFillTriangleFill className={styles.triangleIcon} />
//                 </p>

//                 <div className={styles.symbolPriceContainer}>
//                     <p className={styles.symbolPrice}>{currentPrice ? currentPrice.toFixed(2) : 0}</p>
//                 </div>
//             </div>
//             <div className={styles.chartContainer} ref={chartContainerRef} />
//         </div>
//     );
// };

// export default KLineChart;




