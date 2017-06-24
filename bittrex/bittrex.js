const rp = require('request-promise');

const parse = (response) => {
    return response.result.Ask;
};

const fetch = (coin) => {
    const options = {
        uri: `https://bittrex.com/api/v1.1/public/getticker?market=${coin}`,
        json: true,
    };
    return rp(options).then(parse);
};

const fetchCoinData = async () => {
    const eth = fetch('BTC-ETH');
    const dash = fetch('BTC-DASH');
    const ltc = fetch('BTC-LTC');
    return {
        exchange: 'bittrex',
        priceInfo: {
            ETH: await eth,
            DASH: await dash,
            LTC: await ltc,
        },
    };
};


const connect = (emitter) => {
    console.log('connecting to Bittrex');
    setInterval(async () => {
        const coinData = await fetchCoinData();
        emitter.emit('update', coinData);
    }, 3000);
};

module.exports = {
    connect,
};

