/**
 * Auction End Notifier
 * Script to check and send notifications when auctions end
 * Delegates template rendering to email.service and business logic to auction-notification.service
 */

import { notifyAllEndedAuctions } from '../services/auction-notification.service.js';

/**
 * Check and notify ended auctions
 * This is the main entry point called by the scheduler
 */
export async function checkAndNotifyEndedAuctions() {
  try {
    await notifyAllEndedAuctions();
  } catch (error) {
    console.error('❌ Error checking ended auctions:', error);
  }
}

/**
 * Khởi chạy job định kỳ
 * @param {number} intervalSeconds - Khoảng thời gian giữa các lần kiểm tra (giây)
 */
export function startAuctionEndNotifier(intervalSeconds = 30) {
  console.log(`🚀 Auction End Notifier started (checking every ${intervalSeconds} second(s))`);
  
  // Chạy ngay lần đầu
  checkAndNotifyEndedAuctions();
  
  // Sau đó chạy định kỳ
  setInterval(checkAndNotifyEndedAuctions, intervalSeconds * 1000);
}
