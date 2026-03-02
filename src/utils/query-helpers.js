import db from './db.js';

/**
 * Product-related constants to centralize status definitions and avoid duplication.
 * Used across product.model.js and autoBidding.model.js queries.
 */
export const PRODUCT_STATUSES = {
  SOLD: 'Sold',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  NO_BIDDERS: 'No Bidders'
};

/**
 * Apply the "active auction" filter to a query builder.
 * Active auctions: end_at > NOW() AND closed_at IS NULL
 * @param {Knex.QueryBuilder} qb - Query builder instance
 * @returns {Knex.QueryBuilder} The modified query builder
 */
export function applyActiveFilter(qb) {
  return qb.where('products.end_at', '>', new Date())
           .whereNull('products.closed_at');
}

/**
 * Generate a SQL raw expression for masked bidder name using the DB function.
 * Supports custom table alias and column name for flexibility.
 * @param {string} [userAlias='users'] - Table alias for users table
 * @param {string} [column='fullname'] - Column name containing the full name
 * @param {string} [asName='bidder_name'] - Alias for the masked name in SELECT
 * @returns {Knex.Raw} Raw SQL expression for masked name
 */
export function maskedBidderName(userAlias = 'users', column = 'fullname', asName = 'bidder_name') {
  return db.raw(`mask_name_alternating(${userAlias}.${column}) AS ${asName}`);
}

/**
 * Generate a CASE expression that maps product fields to status strings.
 * Covers: Sold, Cancelled, Pending (auction ended but no sale yet), and Active.
 * Can be used in SELECT clauses across different queries.
 * @returns {Knex.Raw} Raw SQL CASE expression for status
 */
export function statusCaseExpression() {
  return db.raw(`
    CASE
      WHEN products.is_sold IS TRUE THEN '${PRODUCT_STATUSES.SOLD}'
      WHEN products.is_sold IS FALSE THEN '${PRODUCT_STATUSES.CANCELLED}'
      WHEN (products.end_at <= NOW() OR products.closed_at IS NOT NULL) AND products.is_sold IS NULL THEN '${PRODUCT_STATUSES.PENDING}'
    END AS status
  `);
}

/**
 * Generate a SQL expression to count bidding history records for a product.
 * Returns a subquery that counts bids for the current product in a SELECT clause.
 * @returns {Knex.Raw} Raw SQL subquery expression counting bids
 */
export function bidCountExpression() {
  return db.raw(`
    (
      SELECT COUNT(*) 
      FROM bidding_history 
      WHERE bidding_history.product_id = products.id
    ) AS bid_count
  `);
}
