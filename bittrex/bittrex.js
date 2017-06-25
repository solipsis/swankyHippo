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
  const ethP = fetch('BTC-ETH');
  const dashP = fetch('BTC-DASH');
  const ltcP = fetch('BTC-LTC');

  [eth, dash, ltc] = await Promise.all([ethP, dashP, ltcP]);
  return {
    exchange: 'bittrex',
    priceInfo: {
      ETH: eth,
      DASH: dash,
      LTC: ltc,
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
      .catch(() => console.log('error fetching data for bittrex. Retrying...'));
  }, 5000);
};

module.exports = {
  connect,
};
