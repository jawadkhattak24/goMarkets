import { useState, useEffect } from "react";
import styles from "./styles/positionHoldingHistory.module.scss";
import axios from "axios";
import PositionHolding from './../PositionHolding/PositionHolding';

export default function PositionHoldingHistory({ isOrderSubmitted }: { isOrderSubmitted: boolean }) {

  const [positionHolding, setPositionHolding] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [history, setHistory] = useState([]);


  useEffect(() => {

    const fetchPositionHolding = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/trade/user/positionHolding", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        console.log("Trades: ", response.data.trades);
        setPositionHolding(response.data.trades);
      } catch (error) {
        console.error("Error fetching position holding:", error);
      }
    };

    fetchPositionHolding();
  }, [isOrderSubmitted]);


  const [currentPanel, setCurrentPanel] = useState("positionHolding");
  return (
    <div
      className={`${styles.container} ${styles.minH300} ${styles.boxShadow} ${styles.rounded10}`}
    >
      <div
        className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.px20}`}
      >
        <div
          className={`${styles.textMainGray} ${styles.flex} ${styles.textCenter}`}
        >
          <div
            onClick={() => setCurrentPanel("positionHolding")}
            className={`${styles.py10} ${styles.pr20} ${styles.cursorPointer} ${currentPanel === "positionHolding" ? styles.textPrimary : ""
              }`}
          >
            Position holding
          </div>
          <div
            onClick={() => setCurrentPanel("pendingOrders")}
            className={`${styles.py10} ${styles.px20} ${styles.cursorPointer} ${currentPanel === "pendingOrders" ? styles.textPrimary : ""
              }`}
          >
            Pending Orders
          </div>
          <div
            onClick={() => setCurrentPanel("history")}
            className={`${styles.py10} ${styles.px20} ${styles.cursorPointer} ${currentPanel === "history" ? styles.textPrimary : ""
              }`}
          >
            History
          </div>
        </div>
        <div
          className={`${styles.flex} ${styles.itemsCenter} ${styles.textMainGray}`}
        >
          <div>
            Profit and Loss: <span className={styles.textKlineUp}>0</span>
          </div>
          <div className={styles.mx30}>
            Current Margin: <span className={styles.textMainBlack}>0</span>
          </div>
          <div>
            Risk Rate: <span className={styles.textMainBlack}>0%</span>
          </div>
        </div>
      </div>
      {currentPanel === "positionHolding" && <PositionHoldingContainer />}
      {currentPanel === "pendingOrders" && <PendingOrders />}
      {currentPanel === "history" && <History />}
    </div>
  );
}

const PositionHoldingContainer = () => {
  return (
    <div className={`${styles.px20} ${styles.text14} ${styles.mb10}`}>
      <div
        className={`${styles.flex} ${styles.justifyBetween} ${styles.itemsCenter} ${styles.textMainGray} ${styles.text12}`}
      >
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Transaction Pairs
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Reservation No.
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Direction</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Lots</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Lower Unit Price
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Current Price
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Take Profit
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Set Loss</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Handling Fee
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Margin</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Profit</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Open Time</div>
        <div className={`${styles.flex2} ${styles.textCenter}`}>Operation</div>
      </div>
      {/* {positionHolding.length > 0 ? ( */}
      <PositionHolding />

      {/* ) : ( */}
      {/* <div className={styles.empty}>
        <div className={styles.emptyImage}>
          <svg
            viewBox="0 0 79 86"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <defs>
              <linearGradient
                id="linearGradient-1-el-id-615-125"
                x1="38.8503086%"
                y1="0%"
                x2="61.1496914%"
                y2="100%"
              >
                <stop
                  stop-color="var(--el-empty-fill-color-1)"
                  offset="0%"
                ></stop>
                <stop
                  stop-color="var(--el-empty-fill-color-4)"
                  offset="100%"
                ></stop>
              </linearGradient>
              <linearGradient
                id="linearGradient-2-el-id-615-125"
                x1="0%"
                y1="9.5%"
                x2="100%"
                y2="90.5%"
              >
                <stop
                  stop-color="var(--el-empty-fill-color-1)"
                  offset="0%"
                ></stop>
                <stop
                  stop-color="var(--el-empty-fill-color-6)"
                  offset="100%"
                ></stop>
              </linearGradient>
              <rect
                id="path-3-el-id-615-125"
                x="0"
                y="0"
                width="17"
                height="36"
              ></rect>
            </defs>
            <g
              id="Illustrations"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g id="B-type" transform="translate(-1268.000000, -535.000000)">
                <g id="Group-2" transform="translate(1268.000000, 535.000000)">
                  <path
                    id="Oval-Copy-2"
                    d="M39.5,86 C61.3152476,86 79,83.9106622 79,81.3333333 C79,78.7560045 57.3152476,78 35.5,78 C13.6847524,78 0,78.7560045 0,81.3333333 C0,83.9106622 17.6847524,86 39.5,86 Z"
                    fill="var(--el-empty-fill-color-3)"
                  ></path>
                  <polygon
                    id="Rectangle-Copy-14"
                    fill="var(--el-empty-fill-color-7)"
                    transform="translate(27.500000, 51.500000) scale(1, -1) translate(-27.500000, -51.500000) "
                    points="13 58 53 58 42 45 2 45"
                  ></polygon>
                  <g
                    id="Group-Copy"
                    transform="translate(34.500000, 31.500000) scale(-1, 1) rotate(-25.000000) translate(-34.500000, -31.500000) translate(7.000000, 10.000000)"
                  >
                    <polygon
                      id="Rectangle-Copy-10"
                      fill="var(--el-empty-fill-color-7)"
                      transform="translate(11.500000, 5.000000) scale(1, -1) translate(-11.500000, -5.000000) "
                      points="2.84078316e-14 3 18 3 23 7 5 7"
                    ></polygon>
                    <polygon
                      id="Rectangle-Copy-11"
                      fill="var(--el-empty-fill-color-5)"
                      points="-3.69149156e-15 7 38 7 38 43 -3.69149156e-15 43"
                    ></polygon>
                    <rect
                      id="Rectangle-Copy-12"
                      fill="url(#linearGradient-1-el-id-615-125)"
                      transform="translate(46.500000, 25.000000) scale(-1, 1) translate(-46.500000, -25.000000) "
                      x="38"
                      y="7"
                      width="17"
                      height="36"
                    ></rect>
                    <polygon
                      id="Rectangle-Copy-13"
                      fill="var(--el-empty-fill-color-2)"
                      transform="translate(39.500000, 3.500000) scale(-1, 1) translate(-39.500000, -3.500000) "
                      points="24 7 41 7 55 -3.63806207e-12 38 -3.63806207e-12"
                    ></polygon>
                  </g>
                  <rect
                    id="Rectangle-Copy-15"
                    fill="url(#linearGradient-2-el-id-615-125)"
                    x="13"
                    y="45"
                    width="40"
                    height="36"
                  ></rect>
                  <g
                    id="Rectangle-Copy-17"
                    transform="translate(53.000000, 45.000000)"
                  >
                    <use
                      id="Mask"
                      fill="var(--el-empty-fill-color-8)"
                      transform="translate(8.500000, 18.000000) scale(-1, 1) translate(-8.500000, -18.000000) "
                      xlinkHref="#path-3-el-id-615-125"
                    ></use>
                    <polygon
                      id="Rectangle-Copy"
                      fill="var(--el-empty-fill-color-9)"
                      mask="url(#mask-4-el-id-615-125)"
                      transform="translate(12.000000, 9.000000) scale(-1, 1) translate(-12.000000, -9.000000) "
                      points="7 0 24 0 20 18 7 16.5"
                    ></polygon>
                  </g>
                  <polygon
                    id="Rectangle-Copy-18"
                    fill="var(--el-empty-fill-color-2)"
                    transform="translate(66.000000, 51.500000) scale(-1, 1) translate(-66.000000, -51.500000) "
                    points="62 45 79 45 70 58 53 58"
                  ></polygon>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div className={styles.emptyDescription}>
          <p>No data yet</p>
        </div> */}
      {/* </div> */}
      {/* )} */}
    </div>
  );
};
const PendingOrders = () => {
  return (
    <div className={`${styles.px20} ${styles.text14} ${styles.mb10}`}>
      <div
        className={`${styles.flex} ${styles.justifyBetween} ${styles.itemsCenter} ${styles.textMainGray} ${styles.text12}`}
      >
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Transaction Pairs
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Reservation No.
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Direction</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Lots</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Lower Unit Price
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Current Price
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Take Profit
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Set Loss</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Handling fee
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Profit</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Open Time</div>
        <div className={`${styles.flex2} ${styles.textCenter}`}>Operation</div>
      </div>
      <div className={styles.empty}>
        <div className={styles.emptyImage}>
          <svg
            viewBox="0 0 79 86"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <defs>
              <linearGradient
                id="linearGradient-1-el-id-615-125"
                x1="38.8503086%"
                y1="0%"
                x2="61.1496914%"
                y2="100%"
              >
                <stop
                  stop-color="var(--el-empty-fill-color-1)"
                  offset="0%"
                ></stop>
                <stop
                  stop-color="var(--el-empty-fill-color-4)"
                  offset="100%"
                ></stop>
              </linearGradient>
              <linearGradient
                id="linearGradient-2-el-id-615-125"
                x1="0%"
                y1="9.5%"
                x2="100%"
                y2="90.5%"
              >
                <stop
                  stop-color="var(--el-empty-fill-color-1)"
                  offset="0%"
                ></stop>
                <stop
                  stop-color="var(--el-empty-fill-color-6)"
                  offset="100%"
                ></stop>
              </linearGradient>
              <rect
                id="path-3-el-id-615-125"
                x="0"
                y="0"
                width="17"
                height="36"
              ></rect>
            </defs>
            <g
              id="Illustrations"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g id="B-type" transform="translate(-1268.000000, -535.000000)">
                <g id="Group-2" transform="translate(1268.000000, 535.000000)">
                  <path
                    id="Oval-Copy-2"
                    d="M39.5,86 C61.3152476,86 79,83.9106622 79,81.3333333 C79,78.7560045 57.3152476,78 35.5,78 C13.6847524,78 0,78.7560045 0,81.3333333 C0,83.9106622 17.6847524,86 39.5,86 Z"
                    fill="var(--el-empty-fill-color-3)"
                  ></path>
                  <polygon
                    id="Rectangle-Copy-14"
                    fill="var(--el-empty-fill-color-7)"
                    transform="translate(27.500000, 51.500000) scale(1, -1) translate(-27.500000, -51.500000) "
                    points="13 58 53 58 42 45 2 45"
                  ></polygon>
                  <g
                    id="Group-Copy"
                    transform="translate(34.500000, 31.500000) scale(-1, 1) rotate(-25.000000) translate(-34.500000, -31.500000) translate(7.000000, 10.000000)"
                  >
                    <polygon
                      id="Rectangle-Copy-10"
                      fill="var(--el-empty-fill-color-7)"
                      transform="translate(11.500000, 5.000000) scale(1, -1) translate(-11.500000, -5.000000) "
                      points="2.84078316e-14 3 18 3 23 7 5 7"
                    ></polygon>
                    <polygon
                      id="Rectangle-Copy-11"
                      fill="var(--el-empty-fill-color-5)"
                      points="-3.69149156e-15 7 38 7 38 43 -3.69149156e-15 43"
                    ></polygon>
                    <rect
                      id="Rectangle-Copy-12"
                      fill="url(#linearGradient-1-el-id-615-125)"
                      transform="translate(46.500000, 25.000000) scale(-1, 1) translate(-46.500000, -25.000000) "
                      x="38"
                      y="7"
                      width="17"
                      height="36"
                    ></rect>
                    <polygon
                      id="Rectangle-Copy-13"
                      fill="var(--el-empty-fill-color-2)"
                      transform="translate(39.500000, 3.500000) scale(-1, 1) translate(-39.500000, -3.500000) "
                      points="24 7 41 7 55 -3.63806207e-12 38 -3.63806207e-12"
                    ></polygon>
                  </g>
                  <rect
                    id="Rectangle-Copy-15"
                    fill="url(#linearGradient-2-el-id-615-125)"
                    x="13"
                    y="45"
                    width="40"
                    height="36"
                  ></rect>
                  <g
                    id="Rectangle-Copy-17"
                    transform="translate(53.000000, 45.000000)"
                  >
                    <use
                      id="Mask"
                      fill="var(--el-empty-fill-color-8)"
                      transform="translate(8.500000, 18.000000) scale(-1, 1) translate(-8.500000, -18.000000) "
                      xlinkHref="#path-3-el-id-615-125"
                    ></use>
                    <polygon
                      id="Rectangle-Copy"
                      fill="var(--el-empty-fill-color-9)"
                      mask="url(#mask-4-el-id-615-125)"
                      transform="translate(12.000000, 9.000000) scale(-1, 1) translate(-12.000000, -9.000000) "
                      points="7 0 24 0 20 18 7 16.5"
                    ></polygon>
                  </g>
                  <polygon
                    id="Rectangle-Copy-18"
                    fill="var(--el-empty-fill-color-2)"
                    transform="translate(66.000000, 51.500000) scale(-1, 1) translate(-66.000000, -51.500000) "
                    points="62 45 79 45 70 58 53 58"
                  ></polygon>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div className={styles.emptyDescription}>
          <p>No data yet</p>
        </div>
      </div>
    </div>
  );
};
const History = () => {
  return (
    <div className={`${styles.px20} ${styles.text14} ${styles.mb10}`}>
      <div
        className={`${styles.flex} ${styles.justifyBetween} ${styles.itemsCenter} ${styles.textMainGray} ${styles.text12}`}
      >
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Transaction pairs
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Reservation No.
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Direction</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Lots</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Lower Unit Price
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Current Price
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Take Profit
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Set Loss</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>
          Handling Fee
        </div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Margin</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Profit</div>
        <div className={`${styles.flex1} ${styles.textCenter}`}>Open Time</div>
        <div className={`${styles.flex2} ${styles.textCenter}`}>Close Time</div>
      </div>
      <div className={styles.empty}>
        <div className={styles.emptyImage}>
          <svg
            viewBox="0 0 79 86"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <defs>
              <linearGradient
                id="linearGradient-1-el-id-615-125"
                x1="38.8503086%"
                y1="0%"
                x2="61.1496914%"
                y2="100%"
              >
                <stop
                  stop-color="var(--el-empty-fill-color-1)"
                  offset="0%"
                ></stop>
                <stop
                  stop-color="var(--el-empty-fill-color-4)"
                  offset="100%"
                ></stop>
              </linearGradient>
              <linearGradient
                id="linearGradient-2-el-id-615-125"
                x1="0%"
                y1="9.5%"
                x2="100%"
                y2="90.5%"
              >
                <stop
                  stop-color="var(--el-empty-fill-color-1)"
                  offset="0%"
                ></stop>
                <stop
                  stop-color="var(--el-empty-fill-color-6)"
                  offset="100%"
                ></stop>
              </linearGradient>
              <rect
                id="path-3-el-id-615-125"
                x="0"
                y="0"
                width="17"
                height="36"
              ></rect>
            </defs>
            <g
              id="Illustrations"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g id="B-type" transform="translate(-1268.000000, -535.000000)">
                <g id="Group-2" transform="translate(1268.000000, 535.000000)">
                  <path
                    id="Oval-Copy-2"
                    d="M39.5,86 C61.3152476,86 79,83.9106622 79,81.3333333 C79,78.7560045 57.3152476,78 35.5,78 C13.6847524,78 0,78.7560045 0,81.3333333 C0,83.9106622 17.6847524,86 39.5,86 Z"
                    fill="var(--el-empty-fill-color-3)"
                  ></path>
                  <polygon
                    id="Rectangle-Copy-14"
                    fill="var(--el-empty-fill-color-7)"
                    transform="translate(27.500000, 51.500000) scale(1, -1) translate(-27.500000, -51.500000) "
                    points="13 58 53 58 42 45 2 45"
                  ></polygon>
                  <g
                    id="Group-Copy"
                    transform="translate(34.500000, 31.500000) scale(-1, 1) rotate(-25.000000) translate(-34.500000, -31.500000) translate(7.000000, 10.000000)"
                  >
                    <polygon
                      id="Rectangle-Copy-10"
                      fill="var(--el-empty-fill-color-7)"
                      transform="translate(11.500000, 5.000000) scale(1, -1) translate(-11.500000, -5.000000) "
                      points="2.84078316e-14 3 18 3 23 7 5 7"
                    ></polygon>
                    <polygon
                      id="Rectangle-Copy-11"
                      fill="var(--el-empty-fill-color-5)"
                      points="-3.69149156e-15 7 38 7 38 43 -3.69149156e-15 43"
                    ></polygon>
                    <rect
                      id="Rectangle-Copy-12"
                      fill="url(#linearGradient-1-el-id-615-125)"
                      transform="translate(46.500000, 25.000000) scale(-1, 1) translate(-46.500000, -25.000000) "
                      x="38"
                      y="7"
                      width="17"
                      height="36"
                    ></rect>
                    <polygon
                      id="Rectangle-Copy-13"
                      fill="var(--el-empty-fill-color-2)"
                      transform="translate(39.500000, 3.500000) scale(-1, 1) translate(-39.500000, -3.500000) "
                      points="24 7 41 7 55 -3.63806207e-12 38 -3.63806207e-12"
                    ></polygon>
                  </g>
                  <rect
                    id="Rectangle-Copy-15"
                    fill="url(#linearGradient-2-el-id-615-125)"
                    x="13"
                    y="45"
                    width="40"
                    height="36"
                  ></rect>
                  <g
                    id="Rectangle-Copy-17"
                    transform="translate(53.000000, 45.000000)"
                  >
                    <use
                      id="Mask"
                      fill="var(--el-empty-fill-color-8)"
                      transform="translate(8.500000, 18.000000) scale(-1, 1) translate(-8.500000, -18.000000) "
                      xlinkHref="#path-3-el-id-615-125"
                    ></use>
                    <polygon
                      id="Rectangle-Copy"
                      fill="var(--el-empty-fill-color-9)"
                      mask="url(#mask-4-el-id-615-125)"
                      transform="translate(12.000000, 9.000000) scale(-1, 1) translate(-12.000000, -9.000000) "
                      points="7 0 24 0 20 18 7 16.5"
                    ></polygon>
                  </g>
                  <polygon
                    id="Rectangle-Copy-18"
                    fill="var(--el-empty-fill-color-2)"
                    transform="translate(66.000000, 51.500000) scale(-1, 1) translate(-66.000000, -51.500000) "
                    points="62 45 79 45 70 58 53 58"
                  ></polygon>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div className={styles.emptyDescription}>
          <p>No data yet</p>
        </div>
      </div>
    </div>
  );
};
