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
        'poloniex': {
            'ETH': parsePrice(BTC_ETH),
            'DASH': parsePrice(BTC_DASH),
            'LTC': parsePrice(BTC_LTC)
        }
    };

 //   updateEmitter.emit('update', update)
   // console.log(update);
}


let connect = (emitter) => {
    console.log('Connecting to poloniex');
    setInterval(async () => {
        let results = await rp(options)
        emitter.emit('update', process(results))

            //.then(process, (err) => console.log(err))
    }, 5000)
};

module.exports = {
    connect
};
