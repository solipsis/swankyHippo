const rp = require('request-promise')

let options = {
    uri: 'https://poloniex.com/public?command=returnTicker',
    json: true
}

rp(options).then((resp) => console.log(resp))

let connect = () => {
    console.log('Connecting to poloniex')
    setInterval(() => {
        rp(options)
            .then(() => {
                console.log("Polo ticker")
            }, (err) => console.log(err))
    }, 3000)
}