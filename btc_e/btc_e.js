const rp = require('request-promise');

const options = {
  uri: 'https://btc-e.com/api/3/ticker/eth_btc-dsh_btc-ltc_btc',
  json: true,
};


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

const fetchData = async () => {
  const results = await rp(options);
  return process(results);
};


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
