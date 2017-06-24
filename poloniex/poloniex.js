const rp = require('request-promise')

let options = {
    uri: 'https://poloniex.com/public?command=returnTicker',
    json: true
}

let parsePrice = (resp) => {
    return Number(resp.lowestAsk)
}

let process = (coinData) => {
    let {BTC_ETH, BTC_DASH, BTC_LTC} = coinData
    let update = {
        'ETH': parsePrice(BTC_ETH),
        'DASH': parsePrice(BTC_DASH),
        'LTC': parsePrice(BTC_LTC)
    }

    console.log(update)
}

rp(options).then(process)

let connect = () => {
    console.log('Connecting to poloniex')
    setInterval(() => {
        rp(options)
            .then(() => {
                console.log("Polo ticker")
            }, (err) => console.log(err))
    }, 3000)
}

