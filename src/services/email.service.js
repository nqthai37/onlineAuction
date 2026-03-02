import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendMail as sendRawMail } from '../utils/mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Template cache to avoid reading files multiple times
 */
const templateCache = {};

/**
 * Load and compile a Handlebars template from file
 * @param {string} templateName - Name of the template file (without .hbs extension)
 * @returns {Function} Compiled Handlebars template function
 */
function loadTemplate(templateName) {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  const templatePath = path.join(__dirname, '..', 'views', 'emails', `${templateName}.hbs`);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  
  const compiled = handlebars.compile(templateContent);
  templateCache[templateName] = compiled;
  return compiled;
}

/**
 * Register helper for formatting price with thousands separator
 */
handlebars.registerHelper('formatPrice', function(price) {
  return new Intl.NumberFormat('en-US').format(price);
});

/**
 * Send email using a template
 * @param {string} templateName - Name of the template file (without .hbs)
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {Object} context - Data to render in the template
 * @returns {Promise} Result of sending email
 */
export async function sendEmailWithTemplate(templateName, to, subject, context) {
  try {
    const template = loadTemplate(templateName);
    const html = template(context);
    
    return await sendRawMail({
      to,
      subject,
      html
    });
  } catch (error) {
    console.error(`❌ Failed to send email with template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Send winner notification email
 * @param {Object} auction - Auction object with winner_email, winner_name, etc.
 * @param {string} productUrl - Full URL to product detail page
 */
export async function sendWinnerNotification(auction, productUrl) {
  const context = {
    winnerName: auction.winner_name,
    productName: auction.name,
    currentPrice: auction.current_price,
    productUrl
  };

  return sendEmailWithTemplate(
    'auction-winner',
    auction.winner_email,
    `🎉 Congratulations! You won the auction: ${auction.name}`,
    context
  );
}

/**
 * Send seller notification for won auction
 * @param {Object} auction - Auction object with seller details
 * @param {string} productUrl - Full URL to product detail page
 */
export async function sendSellerWonNotification(auction, productUrl) {
  const context = {
    sellerName: auction.seller_name,
    productName: auction.name,
    winnerName: auction.winner_name,
    currentPrice: auction.current_price,
    productUrl
  };

  return sendEmailWithTemplate(
    'auction-seller-won',
    auction.seller_email,
    `🔔 Auction Ended: ${auction.name} - Winner Found!`,
    context
  );
}

/**
 * Send seller notification for auction with no bids
 * @param {Object} auction - Auction object with seller details
 */
export async function sendSellerNoBidsNotification(auction) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3005';
  const context = {
    sellerName: auction.seller_name,
    productName: auction.name,
    createAuctionUrl: `${baseUrl}/seller/add`
  };

  return sendEmailWithTemplate(
    'auction-seller-no-bids',
    auction.seller_email,
    `⏰ Auction Ended: ${auction.name} - No Bidders`,
    context
  );
}
