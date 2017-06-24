const rp = require('request-promise');
//const {EventEmitter} = require('events');

//const updateEmitter = new EventEmitter();

const options = {
    uri: 'https://poloniex.com/public?command=returnTicker',
    json: true
};

let parsePrice = (resp) => {
    return Number(resp.lowestAsk);
};

let process = (coinData) => {
    let {BTC_ETH, BTC_DASH, BTC_LTC} = coinData;
    return { 
        'exchange': 'poloniex',
        'priceInfo': {
            'ETH': parsePrice(BTC_ETH),
            'DASH': parsePrice(BTC_DASH),
            'LTC': parsePrice(BTC_LTC)
        }
    };

}


let connect = (emitter) => {
    console.log('Connecting to poloniex');
    setInterval(async () => {
        let results = await rp(options)
        emitter.emit('update', process(results))
    }, 5000)
};

module.exports = {
    connect
};
