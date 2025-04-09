const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class TradePositionService {
  constructor() {
    this.positions = new Map();
    this.updateIntervals = new Map();
    this.userConnections = new Map();
    this.controlledPairs = new Map();
    this.lastPriceUpdate = new Map();
  }

  async generateRandomPriceMovement(currentPrice, symbol, position) {
    const pairInfo = await prisma.pair.findFirst({
      where: { symbol: "LTCUSD" },
    });

    console.log("pairInfo", pairInfo);

    if (!pairInfo?.isControlled) {
      const volatility = 0.0002;
      const randomFactor = (Math.random() - 0.5) * 2;
      return currentPrice * volatility * randomFactor;
    }

    if (!this.controlledPairs.has(position.id)) {
      this.controlledPairs.set(position.id, {
        startTime: Date.now(),
        startPrice: currentPrice,
      });
      this.lastPriceUpdate.set(position.id, currentPrice);
    }

    console.log("this.controlledPairs", this.controlledPairs);

    const controlInfo = this.controlledPairs.get(position.id);
    const targetPrice =
      controlInfo.startPrice * (1 + pairInfo.controlPercentage / 100);
    const totalTimeMs = 2 * 60 * 1000;
    const elapsedTime = Date.now() - controlInfo.startTime;

    if (elapsedTime >= totalTimeMs) {
      return targetPrice - this.lastPriceUpdate.get(position.id);
    }

    console.log("elapsedTime", elapsedTime);
    console.log("totalTimeMs", totalTimeMs);

    const progressRatio = elapsedTime / totalTimeMs;
    const targetPriceForNow =
      controlInfo.startPrice +
      (targetPrice - controlInfo.startPrice) * progressRatio;
    const priceChange =
      targetPriceForNow - this.lastPriceUpdate.get(position.id);

    this.lastPriceUpdate.set(position.id, targetPriceForNow);

    return priceChange;
  }

  calculateProfit(margin, entryPrice, currentPrice, lots, direction, leverage) {
    const priceDifference =
      direction === "BUY"
        ? currentPrice - entryPrice
        : entryPrice - currentPrice;

    const percentageChange = (priceDifference / entryPrice) * 100 * leverage;
    const profit = Number(margin) * (percentageChange / 100);

    return {
      profit: Number(profit.toFixed(2)),
      percentageChange: Number(percentageChange.toFixed(2)),
    };
  }

  async initializeUserPositions(userId, ws) {
    try {
      const positions = await prisma.trade.findMany({
        where: {
          userId: userId,
          status: "OPEN",
        },
      });

      this.positions.set(userId, positions);

      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId).add(ws);

      return positions;
    } catch (error) {
      console.error("Error initializing user positions:", error);
      throw error;
    }
  }

  async addNewPosition(userId, position) {
    const currentPositions = this.positions.get(userId) || [];
    const updatedPositions = [...currentPositions, position];
    this.positions.set(userId, updatedPositions);

    const userConnections = this.userConnections.get(userId);
    if (userConnections) {
      userConnections.forEach((ws) => {
        if (ws.readyState === 1) {
          ws.send(
            JSON.stringify({
              type: "position_update",
              data: updatedPositions,
            })
          );
        }
      });
    }
  }

  async startPositionUpdates(userId, callback) {
    if (this.updateIntervals.has(userId)) {
      clearInterval(this.updateIntervals.get(userId));
    }

    const interval = setInterval(async () => {
      const positions = this.positions.get(userId);
      if (!positions) return;

      const updatedPositions = await Promise.all(
        positions.map(async (position) => {
          if (position.status !== "OPEN") return position;

          const priceMovement = await this.generateRandomPriceMovement(
            position.currentPrice,
            position.symbol,
            position
          );
          const newCurrentPrice = position.currentPrice + priceMovement;

          const safeCurrentPrice = Math.max(0.001, newCurrentPrice);

          const profitCalc = this.calculateProfit(
            position.margin,
            position.lowerUnitPrice,
            safeCurrentPrice,
            position.lots,
            position.direction,
            position.leverage
          );

          return {
            ...position,
            currentPrice: Number(safeCurrentPrice.toFixed(5)),
            profit: profitCalc.profit,
            percentageChange: profitCalc.percentageChange,
          };
        })
      );

      this.positions.set(userId, updatedPositions);
      callback(updatedPositions);
    }, 1000);

    this.updateIntervals.set(userId, interval);
  }

  async updatePositionStatus(userId, positionId, status) {
    const positions = this.positions.get(userId);
    if (!positions) return;

    const updatedPositions = positions.filter((pos) => pos.id !== positionId);
    this.positions.set(userId, updatedPositions);

    const userConnections = this.userConnections.get(userId);
    if (userConnections) {
      userConnections.forEach((ws) => {
        if (ws.readyState === 1) {
          ws.send(
            JSON.stringify({
              type: "position_update",
              data: updatedPositions,
            })
          );
        }
      });
    }
  }

  removeUserConnection(userId, ws) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
        this.stopPositionUpdates(userId);
      }
    }
  }

  stopPositionUpdates(userId) {
    const interval = this.updateIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(userId);
    }
  }

  cleanup() {
    for (const [userId, interval] of this.updateIntervals) {
      clearInterval(interval);
    }
    this.updateIntervals.clear();
    this.positions.clear();
    this.userConnections.clear();
  }
}

module.exports = new TradePositionService();
