const rp = require('request-promise')

let options = {
    uri: 'https://api.kraken.com/0/public/AssetPairs',
    //uri: 'https://api.kraken.com/0/public/Ticker?pair=[BTCETH,BTCDASH,BTCLTC]',
    json: true
}

 let process = (coinData) => {
     //console.log(coinData['result']['DASHUSD']['a'])
     console.log(coinData)
    // let {BTC_ETH, BTC_DASH, BTC_LTC} = coinData
    // let update = {
    //     'ETH': BTC_ETH,
    //     'DASH': BTC_DASH,
    //     'LTC': BTC_LTC
    // }

    // console.log(update)
}

console.log('Connecting to kraken')
rp(options).then(process)

let connect = () => {
    console.log('Connecting to Kraken')
    setInterval(() => {
        rp(options)
            .then(() => {
                console.log("Kraken ticker")
            }, (err) => console.log(err))
    }, 3000)
}