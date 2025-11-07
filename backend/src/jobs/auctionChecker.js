import { NotificationService } from '../services/notificationService.js';

class AuctionChecker {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Auction checker started - checking for ended auctions every 30 seconds');
    
    // Check immediately on start
    this.checkEndedAuctions();
    
    // Then check every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkEndedAuctions();
    }, 30000); // 30 seconds
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Auction checker stopped');
  }

  async checkEndedAuctions() {
    try {
      await NotificationService.checkAndProcessEndedAuctions(this.io);
    } catch (error) {
      console.error('Error in auction checker:', error);
    }
  }
}

export default new AuctionChecker();
