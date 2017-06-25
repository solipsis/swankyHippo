/**
 * Outputs a table of all price data to the console
 * @param {Map} priceMap map of exchanges to their price data
 * @param {Map} bestAskForCoin a map of a coin symbol to its best price
 */
const outputTable = (priceMap, bestAskForCoin) => {
  console.log('');
  console.log('');
  console.log('*****************************************************');

  for (const [exchange, priceInfo] of priceMap.entries()) {
    console.log(`* ${exchange} | `);
    for (const coin of Object.keys(priceInfo)) {
      // add some padding to make the table pretty
      const paddedCoin = String('     ' + coin).slice(-5);
      const paddedAsk = String('        ' + priceInfo[coin].toPrecision(5)).slice(-8);

      // if not the best value show potential loss
      if (bestAskForCoin.get(coin).exchange === exchange) {
        console.log(`   coin: ${paddedCoin}   ask(BTC): ${paddedAsk} **Best Value**`);
      } else {
        const BTC = 20; // how many bitcoins to convert

        // In a more robust solution you would probably want to use order books
        // to look at the market depth because a fair amount of slippage could
        // occur with an order of 20 bitcoins
        const loss = (priceInfo[coin] * BTC) - (bestAskForCoin.get(coin).ask * BTC);
        console.log(`   coin: ${paddedCoin}   ask(BTC): ${paddedAsk} worse_deal_by: ~${loss.toPrecision(5)} ${coin} `);
      }
    }
    console.log('-------------------------------------------------');
  }
  console.log('*****************************************************');
  console.log('');
  console.log('');
};


/**
 * Formats price data for an exchange into a Format
 * better for the template engine
 * @param {Object} priceMap map of echanges to their coins and prices
 * @param {String} exchange which exchange to create cards for
 * @param {Object} bestAsk map of coin pairs to their best price and exchange
 * @return {Object} cardData map of coin symbol to card info
 */
function cardDataForExchange(priceMap, exchange, bestAsk) {
  const cardData = {};

  // if we don't have data for this exchange return
  const priceData = priceMap.get(exchange);
  if (!priceData) {
    return undefined;
  }

  for (const coin of Object.keys(priceData)) {
    const BTC = 20; // how many bitcoins to convert
    const loss = ((priceData[coin] * BTC) - (bestAsk.get(coin).ask * BTC)).toPrecision(4);

    cardData[coin] = {
      ask: priceData[coin],
      best: bestAsk.get(coin).exchange === exchange,
      loss: String(loss + ` ${coin}`),
    };
  }
  return cardData;
}

module.exports = {
  cardDataForExchange,
  outputTable,
};
