import styles from "./styles/watchList.module.scss";
import TradingPair from "../tradingPair/tradingPair";
import { useState } from "react";

interface WatchListProps {
  onSymbolSelect?: (symbol: string, pricePrecision: number) => void;
  setSelectedPairPrice?: (price: number) => void;
}

const WatchList = ({
  onSymbolSelect,
  setSelectedPairPrice,
}: WatchListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleClick = (symbol: string, pricePrecision: number) => {
    console.log("Symbol clicked: ", symbol);
    onSymbolSelect?.(symbol, pricePrecision);
  };

  const tradingPairs = [
    {
      symbol: "XAUUSD",
      currentPrice: 2947,
      percentageChange: 0.4,
      pricePrecision: 106,
    },
    {
      symbol: "XAGUSD",
      currentPrice: 35.2,
      percentageChange: 0.4,
      pricePrecision: 14,
    },
    {
      symbol: "BTCUSD",
      currentPrice: 2947,
      percentageChange: 0.4,
      pricePrecision: 2,
    },
    {
      symbol: "LTCUSD",
      currentPrice: 143,
      percentageChange: -1.2,
      pricePrecision: 37,
    },
    {
      symbol: "USOIL",
      currentPrice: 80.2,
      percentageChange: 1.2,
      pricePrecision: 12,
    },
    {
      symbol: "UKOIL",
      currentPrice: 80.2,
      percentageChange: 1.2,
      pricePrecision: 11,
    },
    {
      symbol: "ETHUSD",
      currentPrice: 95745,
      percentageChange: 2.3,
      pricePrecision: 3,
    },
    {
      symbol: "USDJPY",
      currentPrice: 100.08,
      percentageChange: -4.2,
      pricePrecision: 17,
    },
    {
      symbol: "EURGBP",
      currentPrice: 0.86,
      percentageChange: 2.2,
      pricePrecision: 18,
    },
    {
      symbol: "NZDUSD",
      currentPrice: 1.08,
      percentageChange: 1.2,
      pricePrecision: 20,
    },
    {
      symbol: "GBPUSD",
      currentPrice: 1.2,
      percentageChange: 1.2,
      pricePrecision: 21,
    },
  ];

  const filteredPairs = tradingPairs.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.watchList}>
      <div className={styles.searchContainer}>
        <div className={styles.searchInput}>
          <i className={styles.searchIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="currentColor"
                d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704"
              ></path>
            </svg>
          </i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className={styles.select}>
          <option value="all">Select</option>
          <option value="crypto">Crypto</option>
          <option value="forex">Forex</option>
          <option value="commodities">Commodities</option>
        </select>
      </div>

      <div className={styles.watchListContainer}>
        {filteredPairs.map((pair) => (
          <TradingPair
            key={pair.symbol}
            symbol={pair.symbol}
            setSelectedPairPrice={setSelectedPairPrice}
            ticker={pair.pricePrecision}
            onClick={() => handleClick(pair.symbol, pair.pricePrecision)}
          />
        ))}
      </div>
    </div>
  );
};

export default WatchList;
