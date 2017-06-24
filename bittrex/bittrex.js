const rp = require('request-promise')


const markets = ['BTC-ETH','BTC-DASH','BTC-LTC']

let updateEmitter;

// const bittrex = (emitter) => {
//     this.emitter = emitter
// }

// let process = (coinData) => {
//     let {BTC_ETH, BTC_DASH, BTC_LTC} = coinData
//     let update = {
//         'bittrex': {
//             'ETH': BTC_ETH,
//             'DASH': BTC_DASH,
//             'LTC': BTC_LTC
//         }
//     }

//     console.log(update)
// }

let parse = (response) => {
    return response.result.Ask
}

let fetchCoinData = async () => {
    let eth = fetch('BTC-ETH')
    let dash = fetch('BTC-DASH')
    let ltc = fetch('BTC-LTC')
    return {
        'bittrex': {
            'ETH': await eth,
            'DASH': await dash,
            'LTC': await ltc
        }
    }
}

const fetch = (coin) => {
    let options = {
        uri: `https://bittrex.com/api/v1.1/public/getticker?market=${coin}`,
        json: true
    }
    return rp(options).then(parse)
}

let connect = (emitter) => {
    
    console.log('connecting to Bittrex')
    setInterval(async () => {
        let coindater = await fetchCoinData();
        emitter.emit('update', coindater)
    }, 5000);
}

module.exports = {
    connect
}

