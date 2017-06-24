const rp = require('request-promise');

const options = {
    uri: 'https://btc-e.com/api/3/ticker/eth_btc-dsh_btc-ltc_btc',
    json: true,
};


const process = (coinData) => {
    const { eth_btc, dsh_btc, ltc_btc } = coinData;
    return { 
        exchange: 'btc-e',
        priceInfo: {
            ETH: eth_btc.sell,
            DASH: dsh_btc.sell,
            LTC: ltc_btc.sell,
        },
    };
};


const connect = (emitter) => {
    console.log('Connecting to btc-e');
    setInterval(async () => {
        const results = await rp(options);
        emitter.emit('update', process(results));
    }, 5000);
};

module.exports = {
    connect,
};
