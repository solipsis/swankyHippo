const express = require('express');
const poloniex = require('./poloniex/poloniex');
const bittrex = require('./bittrex/bittrex');
const btc_e = require('./btc_e/btc_e');
const hbs = require('hbs');
const { EventEmitter } = require('events');

const updateEmitter = new EventEmitter();
const app = express();

// set up view engine and serve style files
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use('/style',express.static( 'style'));


// subscribe to the update event
updateEmitter.on('update', (coinData) => {
    applyUpdate(coinData);
});
poloniex.connect(updateEmitter);
bittrex.connect(updateEmitter);
btc_e.connect(updateEmitter);

const priceMap = new Map();
let bestAskForCoin = new Map();

/**
 * Update the price map
 * @param {Object} update containing an exchange and price info
 */
const applyUpdate = (update) => {
    priceMap.set(update.exchange, update.priceInfo);
    outputTable(getBestAskForCoins());
};

/**
 * Calculates which exchange has the best price for each coin
 * @return {Map} map of coin symbol to price and exchange
 */
const getBestAskForCoins = () => {
    
    // map of coin to {exchange, ask}
    let bestAskPerCoin = new Map();

    for (let [exchange, priceInfo] of priceMap.entries()) {
        for (let coin of Object.keys(priceInfo)) {
            if (!bestAskPerCoin.get(coin) || priceInfo[coin] < bestAskPerCoin.get(coin).ask) {
                bestAskPerCoin.set(coin, {
                    exchange: exchange,
                    ask: priceInfo[coin],
                });
            }
        }
    }
    
    return bestAskPerCoin;
}

/**
 * Outputs a table of all price data to the console
 * @param {Map} bestAskForCoin a map of a coin symbol to its best price 
 */
const outputTable = (bestAskForCoin) => {
    console.log('')
    console.log('')
    console.log('*****************************************************')
    for (let [exchange, priceInfo] of priceMap.entries()) {
        console.log(`* ${exchange} | `);
        for (let coin of Object.keys(priceInfo)) {

            // add some padding to make the table pretty
            const paddedCoin = String("     " + coin).slice(-5);
            const paddedAsk = String("        " + priceInfo[coin].toPrecision(5)).slice(-8);

            // if not the best value show potential loss
            if (bestAskForCoin.get(coin).exchange == exchange) {
                console.log(`   coin: ${paddedCoin}   ask(BTC): ${paddedAsk} **Best Value**`)
            } else {
                const BTC = 20; // how many bitcoins to convert
                const loss = (priceInfo[coin] * BTC) - (bestAskForCoin.get(coin).ask * BTC);
                console.log(`   coin: ${paddedCoin}   ask(BTC): ${paddedAsk} worse_deal_by: ~${loss.toPrecision(5)} ${coin} `)
            }
        }
        console.log('-------------------------------------------------')
    }
    console.log('*****************************************************')
    console.log('')
    console.log('')
}

/**
 * Serves up the landing page with price info
 */
app.get('/', (req, res) => {
    
        res.render('index.hbs', 
        {
            bittrex: cardDataForExchange('bittrex'),
            poloniex: cardDataForExchange('poloniex'),
            btc_e: cardDataForExchange('btc-e')
        });
    
})

/**
 * Formats price data for an exchange into a Format
 * better for the template engine
 * @param {String} exchange which exchange to create cards for
 * @return {Object} cardData map of coin symbol to card info
 */
const cardDataForExchange = (exchange) => {
    
    cardData = {};
    const bestAsk = getBestAskForCoins();

    // if we don't have data for this exchange return
    priceData = priceMap.get(exchange);
    if(!priceData) {
        return;
    }

    for (let coin of Object.keys(priceData)) {

        const BTC = 20; // how many bitcoins to convert
        const loss = ((priceData[coin] * BTC) - (bestAsk.get(coin).ask * BTC)).toPrecision(4);

        cardData[coin] = {
            ask: priceData[coin],
            best: bestAsk.get(coin).exchange == exchange,
            loss: String(loss + ` ${coin}`),
        };         
    };
    return cardData;
};

/**
 * Returns all the price information as a json payload
 * @return {JSON} price data
 */
app.get('/all', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify([...priceMap], undefined, 2));
});

/**
 * Returns the exchange and price of the best deal for each coin
 * @return {JSON} best price data
 */
app.get('/best', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify([...getBestAskForCoins()], undefined, 2));
});

// start listening on port 3000
app.listen(3000, () => {
    console.log('Server is up on port 3000');
});
