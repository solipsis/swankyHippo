const rp = require('request-promise');

const options = {
    uri: 'https://poloniex.com/public?command=returnTicker',
    json: true,
};

const parsePrice = (resp) => {
    return Number(resp.lowestAsk);
};

const process = (coinData) => {
    const {BTC_ETH, BTC_DASH, BTC_LTC} = coinData;
    return { 
        exchange: 'poloniex',
        priceInfo: {
            ETH: parsePrice(BTC_ETH),
            DASH: parsePrice(BTC_DASH),
            LTC: parsePrice(BTC_LTC),
        },
    };

}


const connect = (emitter) => {
    console.log('Connecting to poloniex');
    setInterval(async () => {
        const results = await rp(options);
        emitter.emit('update', process(results));
    }, 3000);
};

module.exports = {
    connect,
};
