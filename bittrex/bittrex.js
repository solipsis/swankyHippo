const rp = require('request-promise');

const parse = (response) => {
    return response.result.Ask;
};

const fetch = async (coin) => {
    const options = {
        uri: `https://bittrex.com/api/v1.1/public/getticker?market=${coin}`,
        json: true,
    };
    
    const coinData = await rp(options)
    return parse(coinData)
};

const fetchCoinData = async () => {
    const eth_p = fetch('BTC-ETH');
    const dash_p = fetch('BTC-DASH');
    const ltc_p = fetch('BTC-LTC');

    [eth, dash, ltc] = await Promise.all([eth_p, dash_p, ltc_p])
    return {
        exchange: 'bittrex',
        priceInfo: {
            ETH: eth,
            DASH: dash,
            LTC: ltc,
        },
    };
};


const connect = (emitter) => {
    console.log('connecting to Bittrex');

    setInterval(() => {
        fetchCoinData()
            .then( coinData => emitter.emit('update', coinData))
            .catch( (e) => console.log('error fetching data for bittrex. Retrying...'));

    }, 5000);
};

module.exports = {
    connect,
};

