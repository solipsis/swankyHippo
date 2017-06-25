const rp = require('request-promise');

const parse = response => response.result.Ask;

const fetch = async (coin) => {
  const options = {
    uri: `https://bittrex.com/api/v1.1/public/getticker?market=${coin}`,
    json: true,
  };

  const coinData = await rp(options);
  return parse(coinData);
};

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
