const rp = require('request-promise');

const options = {
  uri: 'https://poloniex.com/public?command=returnTicker',
  json: true,
};

const parsePrice = resp => Number(resp.lowestAsk);

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

const fetchData = async () => {
  const coinData = await rp(options);
  return process(coinData);
};


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
};
