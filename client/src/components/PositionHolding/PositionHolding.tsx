import { useEffect, useState } from 'react';
import styles from './styles/PositionHolding.module.scss';
import axios from 'axios';

interface Trade {
  transactionPairs: string;
  reservationNumber: string;
  direction: 'BUY' | 'SELL';
  lots: number;
  lowerUnitPrice: number;
  currentPrice: number;
  takeProfit: number;
  setLoss: number;
  handlingFee: number;
  margin: number;
  profit: number;
  openTime: string;
  closeTime: string;
}

const PositionHolding = () => {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/trade/user/positionHolding', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrades(response.data.trades);
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: "2-digit",
      }),
      time: date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
    };
  };

  return (
    <div className={styles.positionHoldingContainer}>
      <div className={styles.tableContainer}>
        <div className={styles.tableContent}>
          {trades.map((trade) => (
            <div key={trade.reservationNumber} className={styles.tableRow}>
              <div className={styles.cell}>{trade.transactionPairs}</div>
              <div className={styles.cell}>{trade.reservationNumber}</div>
              <div className={styles.cell}>
                <span className={trade.direction === 'BUY' ? styles.buyButton : styles.sellButton}>
                  {trade.direction}
                </span>
              </div>
              <div className={styles.cell + ' ' + styles.rightAlign}>{trade.lots}</div>
              <div className={styles.cell + ' ' + styles.rightAlign}>{trade.lowerUnitPrice.toFixed(5)}</div>
              <div className={styles.cell + ' ' + styles.rightAlign}>{trade.currentPrice?.toFixed(5) || '-'}</div>
              <div className={styles.cell + ' ' + styles.rightAlign}>{trade.takeProfit || 0}</div>
              <div className={styles.cell + ' ' + styles.rightAlign}>{trade.setLoss || 0}</div>
              <div className={styles.cell + ' ' + styles.rightAlign}>{trade.handlingFee.toFixed(6)}</div>
              <div className={styles.cell + ' ' + styles.rightAlign}>{trade.margin.toFixed(2)}</div>
              <div className={styles.cell + ' ' + styles.rightAlign + ' ' + (trade.profit < 0 ? styles.negative : styles.positive)}>
                {trade.profit?.toFixed(2) || '0.00'}
              </div>
              <div className={styles.cell}>{formatDate(trade.openTime).date} <br /> {formatDate(trade.openTime).time}</div>
              <div className={styles.cell}>{trade.closeTime ? formatDate(trade.closeTime).date + ' ' + formatDate(trade.closeTime).time : '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PositionHolding; 