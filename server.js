const express = require('express');
const poloniex = require('./poloniex/poloniex');
const bittrex = require('./bittrex/bittrex');
const btc_e = require('./btc_e/btc_e');
const hbs = require('hbs');
const output = require('./output/output')
const { EventEmitter } = require('events');

const port = process.env.PORT || 3000
const updateEmitter = new EventEmitter();
const app = express();

// set up view engine and serve style files
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use('/style', express.static('style'));


// subscribe to the update event
updateEmitter.on('update', (coinData) => {
  applyUpdate(coinData);
});
poloniex.connect(updateEmitter);
bittrex.connect(updateEmitter);
btc_e.connect(updateEmitter);

// map to store current state of prices across exchanges
const priceMap = new Map();

/**
 * Update the price map
 * @param {Object} update containing an exchange and price info
 */
const applyUpdate = (update) => {
  priceMap.set(update.exchange, update.priceInfo);

  // rerender the output table
  output.outputTable(priceMap, getBestAskForCoins());
};

/**
 * Calculates which exchange has the best price for each coin
 * @return {Map} map of coin symbol to price and exchange
 */
const getBestAskForCoins = () => {

  // map of coin to {exchange, ask}
  let bestAskPerCoin = new Map();

  for (let [exchange, priceInfo] of priceMap.entries()) {
    for (let coin of Object.keys(priceInfo)) {
      // if its the first one we find or its lowest price so far
      if (!bestAskPerCoin.get(coin) || priceInfo[coin] < bestAskPerCoin.get(coin).ask) {
        bestAskPerCoin.set(coin, {
          exchange: exchange,
          ask: priceInfo[coin],
        });
      }
    }
  }

  return bestAskPerCoin;
}



/**
 * Serves up the landing page with price info
 */
app.get('/', (req, res) => {

  const bestAsk = getBestAskForCoins();
  res.render('index.hbs', {
    bittrex: output.cardDataForExchange(priceMap, 'bittrex', bestAsk),
    poloniex: output.cardDataForExchange(priceMap, 'poloniex', bestAsk),
    btc_e: output.cardDataForExchange(priceMap, 'btc-e', bestAsk)
  });

})



/**
 * Returns all the price information as a json payload
 * @return {JSON} price data
 */
app.get('/all', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify([...priceMap], undefined, 2));
});

/**
 * Returns the exchange and price of the best deal for each coin
 * @return {JSON} best price data
 */
app.get('/best', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify([...getBestAskForCoins()], undefined, 2));
});

// start listening on port {port}
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

module.exports = {
    app,
};
