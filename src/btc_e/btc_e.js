const rp = require('request-promise');

// options for request to BTC-E
const options = {
  uri: 'https://btc-e.com/api/3/ticker/eth_btc-dsh_btc-ltc_btc',
  json: true,
};

/**
 * extract the pairs from a btc_e response and return them
 * mapped to the price
 * @param {JSON} coinData response
 * @return {Object} Dictionary of coin symbol to its price
 */
const process = (coinData) => {
  const {
    eth_btc,
    dsh_btc,
    ltc_btc,
  } = coinData;
  return {
    exchange: 'btc-e',
    priceInfo: {
      ETH: eth_btc.sell,
      DASH: dsh_btc.sell,
      LTC: ltc_btc.sell,
    },
  };
};

/**
 * request the pair data from btc-e and the parse
 * @param {Object} update containing an exchange and price info
 * @return {Object} Dictionary of coin symbol to its price
 */
const fetchData = async () => {
  const results = await rp(options);
  return process(results);
};

/**
 * Create a reccuring request to fetch BTC-E pair data
 * and notify upon updates
 * @param {EventEmitter} emitter notify listeners of updates
 */
const connect = (emitter) => {
  console.log('Connecting to btc-e');
  setInterval(() => {
    fetchData()
      .then((coinData) => { emitter.emit('update', coinData); })
      .catch(() => { console.log('failed to fetch btc_e data. Retrying...'); });
  }, 5000);
};

module.exports = {
  connect,
};
