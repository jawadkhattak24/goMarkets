import { useEffect, useState } from "react";

import styles from "./styles/tradingPair.module.scss";

const TradingPair = ({ symbol, onClick, ticker, setSelectedPairPrice }) => {
  const [percentageChange, setPercentageChange] = useState(0);
  const isNegative = percentageChange < 0;
  const directionClass = isNegative ? styles.down : styles.up;
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://api.gomktsglb.cc/v1/api/forex/kline?forex_id=${ticker}&period=1min&from=1741531680000&to=1741561680000&t=1741561693389`
      );
      const data = await response.json();
      setPrice(data.data[0].Close);
      setPercentageChange(data.data[0].Change);
      // console.log(data.data[0]);
      // console.log("Price", data.data[0].Close);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, [ticker]);

  let logo;

  console.log("Rendering TradingPair");

  if (symbol === "USOIL") {
    logo = "https://api.texttrademo.com/uploads/logo/USOil.png";
  } else if (symbol === "UKOIL") {
    logo = "https://api.texttrademo.com/uploads/logo/UKOil.png";
  } else {
    logo = `https://api.texttrademo.com/uploads/logo/${symbol}.png`;
  }

  return (
    <div
      className={styles.tradingPairContainer}
      onClick={() => {
        onClick(symbol);
        setSelectedPairPrice(price);
      }}
    >
      <div className={styles.symbolSection}>
        <img src={logo} alt={symbol} />
        <span>{symbol}</span>
      </div>
      <div className={`${styles.priceSection} ${directionClass}`}>
        {price?.toFixed(2)}
      </div>
      <span className={`${styles.percentageChange} ${directionClass}`}>
        {percentageChange ? (percentageChange > 0 ? "+" : "") : ""}
        {percentageChange ? percentageChange : "0"}%
      </span>
    </div>
  );
};

export default TradingPair;
