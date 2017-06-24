const express = require('express');
const poloniex = require('./poloniex/poloniex');
const bittrex = require('./bittrex/bittrex');
const btc_e = require('./btc_e/btc_e');
const { EventEmitter } = require('events');

const updateEmitter = new EventEmitter();
const app = express();


updateEmitter.on('update', (coinData) => {
    console.log(coinData);
    applyUpdate(coinData);
});
poloniex.connect(updateEmitter);
bittrex.connect(updateEmitter);
btc_e.connect(updateEmitter);

const priceMap = new Map();
let bestAskForCoin = new Map();

const applyUpdate = (update) => {
    priceMap.set(update.exchange, update.priceInfo);
  //  console.log("Current map: ", priceMap);
    outputTable(getBestAskForCoins());
};

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
                console.log(`   coin: ${paddedCoin}   ask(BTC): ${paddedAsk} potential_loss(${BTC}BTC) = ~${loss.toPrecision(5)} ${coin} `)
            }
        }
        console.log('-------------------------------------------------')
    }
    console.log('*****************************************************')
    console.log('')
    console.log('')
}

app.get('/all', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify([...priceMap], undefined, 2));
});

app.get('/best', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify([...getBestAskForCoins()], undefined, 2));
});


app.listen(3000, () => {
    console.log('Server is up on port 3000');
});