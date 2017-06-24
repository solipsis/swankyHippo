const rp = require('request-promise');

const parse = (response) => {
    return response.result.Ask;
};

const fetch = (coin) => {
    const options = {
        uri: `https://bittrex.com/api/v1.1/public/getticker?market=${coin}`,
        json: true,
    };
    return rp(options)
    .then(parse)
    .catch((err) => {throw new Error(`Error fetching bittrex data for coin: ${coin}`)})
    // try {
    //     const response = await rp(options);
    // }
    // } catch(e) {
    //     //throw new Error(`Error fetching bittrex data for coin: ${coin}`)
    //     console.log('eeeeeeeeeeeeeeeeeeeeeeee')
    // }
        //return parse(response);
    
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

    setInterval(() => {
       // try {
            fetchCoinData().then( (coinData) => {
            emitter.emit('update', coinData) }
            ).catch( (e) => console.log('error fetching data for bittrex. Retrying...'));
            
            
    //     } catch (e) {
    //         console.log("ERERORER ROEURRREROORR")
    //    //     throw new Error('Error fetching Bittrex data. Retrying...')
    //     }
        
        
        
    }, 5000);
};

module.exports = {
    connect,
};

