const rp = require('request-promise')


const markets = ['BTC-ETH','BTC-DASH','BTC-LTC']

let process = (coinData) => {
    let {BTC_ETH, BTC_DASH, BTC_LTC} = coinData
    let update = {
        'ETH': BTC_ETH,
        'DASH': BTC_DASH,
        'LTC': BTC_LTC
    }

    console.log(update)
}

let parse = (response) => {
    return response.result.Ask
}

let fetchCoinData = async () => {
    let eth = fetch('BTC-ETH')
    let dash = fetch('BTC-DASH')
    let ltc = fetch('BTC-LTC')
    return {
        'ETH': await eth,
        'DASH': await dash,
        'LTC': await ltc
    }
}

const fetch = (coin) => {
    let options = {
        uri: `https://bittrex.com/api/v1.1/public/getticker?market=${coin}`,
        json: true
    }
    return rp(options).then(parse)
}

let blah = async () => {
    let coindater =  await fetchCoinData();
   // console.log(coindater.map())
console.log(coindater)

}
blah()

let connect = () => {
    console.log('Connecting to poloniex')
    setInterval(() => {
        rp(options)
            .then(() => {
                console.log("Polo ticker")
            }, (err) => console.log(err))
    }, 3000)
}

