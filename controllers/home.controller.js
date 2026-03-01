import * as productModel from '../models/product.model.js';

export async function getHome(req, res) {
  try {
    const [topEnding, topBids, topPrice] = await Promise.all([
      productModel.findTopEnding(),
      productModel.findTopBids(),
      productModel.findTopPrice()
    ]);
    res.render('home', {
      topEndingProducts: topEnding,
      topBidsProducts: topBids,
      topPriceProducts: topPrice
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export default { getHome };
