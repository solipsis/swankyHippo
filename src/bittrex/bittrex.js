const rp = require('request-promise');

/**
 * parse out the ask (price) from the response object
 * @param {Object} response bittrex response
 * @return {Number} price
 */
const parse = response => response.result.Ask;

/**
 * fetch the price info for a single coin pair
 * @param {String} coin which coin pair to get data for
 * @return {Promise} price data
 */
const fetch = async (coin) => {
  const options = {
    uri: `https://bittrex.com/api/v1.1/public/getticker?market=${coin}`,
    json: true,
  };

  const coinData = await rp(options);
  return parse(coinData);
};

/**
 * Bittrex only supports fetching data for one pair at a time so
 * kick off those requests in parallel
 * @param {Object} update containing an exchange and price info
 * @return {Object} Dictionary of coin symbol to its price
 */
const fetchCoinData = async () => {
  const eth = fetch('BTC-ETH');
  const dash = fetch('BTC-DASH');
  const ltc = fetch('BTC-LTC');

  const p = await Promise.all([eth, dash, ltc]);

  return {
    exchange: 'bittrex',
    priceInfo: {
      ETH: p[0],
      DASH: p[1],
      LTC: p[2],
    },
  };
};

/**
 * Create a reccuring request to bittrex that executes every 5 seconds
 * @param {EventEmitter} emitter event emitter for signaling updates
 */
const connect = (emitter) => {
  console.log('connecting to Bittrex');

  setInterval(() => {
    fetchCoinData()
      .then(coinData => emitter.emit('update', coinData))
      .catch((e) => console.log(e,'error fetching data for bittrex. Retrying...'));
  }, 5000);
};

module.exports = {
  connect,
};
