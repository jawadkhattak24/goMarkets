import { useState } from "react";
import styles from "./styles/orderPanel.module.scss";
// import CaretDownIcon from "./icons/caret-down";
import MinusIcon from "./icons/minus";
import PlusIcon from "./icons/plus";
import { useAuth } from "../../contexts/authContext";

const OrderPanel = ({
  isRegisterOpen,
  setIsRegisterOpen,
  isLoginOpen,
  setIsLoginOpen,
  isUserPanelOpen,
  setIsUserPanelOpen,
  symbol,
  selectedPairPrice,
}: {
  isRegisterOpen: boolean;
  setIsRegisterOpen: (value: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (value: boolean) => void;
  isUserPanelOpen: boolean;
  setIsUserPanelOpen: (value: boolean) => void;
  symbol: string;
  selectedPairPrice: number;
}) => {
  const [setLoss, setSetLoss] = useState(false);
  const [takeProfit, setTakeProfit] = useState(false);
  const [lots, setLots] = useState(0.1);
  const { isLoggedIn, currentUser } = useAuth();

  return (
    <>
      <div className={styles.orderPanelWrapper}>
        <div className={styles.buttonsContainer}>
          {currentUser?.email === undefined ? (
            <>
              <button
                className={styles.registerButton}
                onClick={() => setIsRegisterOpen(!isRegisterOpen)}
              >
                Register
              </button>
              <div className={styles.divider}></div>
              <button
                className={styles.loginButton}
                onClick={() => setIsLoginOpen(!isLoginOpen)}
              >
                Login
              </button>
            </>
          ) : (
            <button
              className={styles.loginButton}
              onClick={() => setIsUserPanelOpen(!isUserPanelOpen)}
            >
              {currentUser?.email}
            </button>
          )}
        </div>
        <div className={styles.fundsPanel}>
          <div className={styles.fundsLabel}>Available funds</div>
          <div className={styles.fundsAmount}>
            {currentUser?.availableFunds}
          </div>
        </div>

        <div className={styles.orderBox}>
          <div className={styles.symbolName}>{symbol}</div>
          <div className={styles.price}>{selectedPairPrice.toFixed(2)}</div>

          <div className={styles.selectWrapper}>
            <select
              style={{ cursor: "pointer" }}
              className={styles.select}
              defaultValue=""
            >
              <option value="" disabled>
                Market Price
              </option>
              <option value="pending">Pending Orders</option>
            </select>
          </div>

          <div className={styles.multiplierSection}>
            <div className={styles.label}>Multiplier</div>
            <div className={styles.selectWrapper}>
              <select
                style={{ cursor: "pointer" }}
                className={styles.select}
                defaultValue="100"
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>

          <div className={styles.controlSection}>
            <div className={styles.controlHeader}>
              <span>Set Loss</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={setLoss}
                  onChange={(e) => setSetLoss(e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.numberInput}>
              <button className={styles.decrease} disabled={!setLoss}>
                <MinusIcon />
              </button>
              <input type="number" disabled={!setLoss} value="0" readOnly />
              <button className={styles.increase} disabled={!setLoss}>
                <PlusIcon />
              </button>
            </div>
          </div>

          <div className={styles.controlSection}>
            <div className={styles.controlHeader}>
              <span>Take Profit</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.numberInput}>
              <button className={styles.decrease} disabled={!takeProfit}>
                <MinusIcon />
              </button>
              <input type="number" disabled={!takeProfit} value="0" readOnly />
              <button className={styles.increase} disabled={!takeProfit}>
                <PlusIcon />
              </button>
            </div>
          </div>

          <div className={styles.lotsSection}>
            <div className={styles.label}>Lots(Step:0.01)</div>
            <div className={styles.numberInput}>
              <button
                className={styles.decrease}
                onClick={() => setLots((prev) => Math.max(0.01, prev - 0.01))}
              >
                <MinusIcon />
              </button>
              <input
                type="number"
                value={lots}
                onChange={(e) => setLots(Number(e.target.value))}
                step="0.01"
                min="0.01"
              />
              <button
                className={styles.increase}
                onClick={() => setLots((prev) => prev + 0.01)}
              >
                <PlusIcon />
              </button>
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoRow}>
              <span>Each Lots</span>
              <span>1 Lots = 1 {symbol}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Estimated Handling Fee</span>
              <span>0.095410</span>
            </div>
            <div className={styles.infoRow}>
              <span>Estimated Margin</span>
              <span>95.409640</span>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.buyButton}>Buy</button>
            <button className={styles.sellButton}>Sell</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderPanel;
