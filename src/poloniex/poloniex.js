const rp = require('request-promise');


/**
 * extract the pairs from a btc_e response and return them
 * mapped to the price
 * @param {JSON} resp response
 * @return {Number} price of the lowest ask
 */
const parsePrice = resp => Number(resp.lowestAsk);

/**
 * extract the pairs from a poloniex response and return them
 * mapped to the price
 * @param {JSON} coinData response
 * @return {Object} Dictionary of coin symbol to its price
 */
const process = (coinData) => {
  const {
    BTC_ETH,
    BTC_DASH,
    BTC_LTC,
  } = coinData;
  return {
    exchange: 'poloniex',
    priceInfo: {
      ETH: parsePrice(BTC_ETH),
      DASH: parsePrice(BTC_DASH),
      LTC: parsePrice(BTC_LTC),
    },
  };
};

// request options
const options = {
  uri: 'https://poloniex.com/public?command=returnTicker',
  json: true,
};

/**
 * make a request to poloniex and the parse the result
 * @return {Promise} Dictionary of coin symbol to its price
 */
const fetchData = async () => {
  const coinData = await rp(options);
  return process(coinData);
};


/**
 * create a recurring request to poloniex for pair data
 * @param {EventEmitter} emitter event emitter to notify of updates
 */
const connect = (emitter) => {
  console.log('Connecting to poloniex');

  setInterval(() => {
    fetchData()
      .then(coinData => emitter.emit('update', coinData))
      .catch(() => console.log('Error connecting to poloniex. Retrying ...'));
  }, 5000);
};

module.exports = {
  connect,
  parsePrice,
  process,
};
