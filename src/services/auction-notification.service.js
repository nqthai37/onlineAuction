/**
 * Auction Notification Service
 * Encapsulates business logic for auction end notifications
 */

import * as productModel from '../models/product.model.js';
import {
  sendWinnerNotification,
  sendSellerWonNotification,
  sendSellerNoBidsNotification
} from './email.service.js';

/**
 * Process a single ended auction and send appropriate notifications
 * @param {Object} auction - Auction data from getNewlyEndedAuctions()
 * @returns {Promise<Object>} Result with success status and notification details
 */
export async function processAuctionEnd(auction) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3005';
  const productUrl = `${baseUrl}/products/detail?id=${auction.id}`;
  const result = {
    productId: auction.id,
    productName: auction.name,
    notifications: [],
    errors: []
  };

  try {
    // Case 1: Auction has a winner
    if (auction.highest_bidder_id) {
      // Send notification to winner
      if (auction.winner_email) {
        try {
          await sendWinnerNotification(auction, productUrl);
          result.notifications.push({
            type: 'winner',
            recipient: auction.winner_email,
            status: 'sent'
          });
          console.log(`✅ Winner notification sent to ${auction.winner_email} for product #${auction.id}`);
        } catch (error) {
          result.errors.push({
            type: 'winner',
            recipient: auction.winner_email,
            error: error.message
          });
          console.error(`❌ Failed to send winner notification:`, error);
        }
      }

      // Send notification to seller
      if (auction.seller_email) {
        try {
          await sendSellerWonNotification(auction, productUrl);
          result.notifications.push({
            type: 'seller_won',
            recipient: auction.seller_email,
            status: 'sent'
          });
          console.log(`✅ Seller notification (winner) sent to ${auction.seller_email} for product #${auction.id}`);
        } catch (error) {
          result.errors.push({
            type: 'seller_won',
            recipient: auction.seller_email,
            error: error.message
          });
          console.error(`❌ Failed to send seller notification:`, error);
        }
      }
    }
    // Case 2: Auction has no bids
    else {
      if (auction.seller_email) {
        try {
          await sendSellerNoBidsNotification(auction);
          result.notifications.push({
            type: 'seller_no_bids',
            recipient: auction.seller_email,
            status: 'sent'
          });
          console.log(`✅ Seller notification (no bids) sent to ${auction.seller_email} for product #${auction.id}`);
        } catch (error) {
          result.errors.push({
            type: 'seller_no_bids',
            recipient: auction.seller_email,
            error: error.message
          });
          console.error(`❌ Failed to send seller no-bids notification:`, error);
        }
      }
    }

  } catch (error) {
    result.errors.push({
      type: 'processing',
      error: error.message
    });
    console.error(`❌ Error processing auction #${auction.id}:`, error);
  }

  return result;
}

/**
 * Check all newly ended auctions and send notifications
 * @returns {Promise<Object>} Summary of all notifications sent
 */
export async function notifyAllEndedAuctions() {
  try {
    const endedAuctions = await productModel.getNewlyEndedAuctions();

    if (endedAuctions.length === 0) {
      console.log('ℹ️ No ended auctions to notify');
      return {
        totalAuctions: 0,
        processed: [],
        timestamp: new Date()
      };
    }

    console.log(`📧 Found ${endedAuctions.length} ended auctions to notify`);

    const results = [];
    for (const auction of endedAuctions) {
      const result = await processAuctionEnd(auction);
      results.push(result);

      // Mark notification as sent in database
      try {
        await productModel.markEndNotificationSent(auction.id);
      } catch (markError) {
        console.error(`❌ Failed to mark notification as sent for product #${auction.id}:`, markError);
      }
    }

    return {
      totalAuctions: endedAuctions.length,
      processed: results,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('❌ Error in notifyAllEndedAuctions:', error);
    throw error;
  }
}
