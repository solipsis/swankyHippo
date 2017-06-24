const express = require('express');
const poloniex = require('./poloniex/poloniex');
const bittrex = require('./bittrex/bittrex');
const { EventEmitter } = require('events');

const coins = ['ETH', 'DASH', 'LTC'];
const updateEmitter = new EventEmitter();
const app = express();

app.listen(3000, () => {
    console.log('Server is up on port 3000');
});

updateEmitter.on('update', (coinData) => {
    console.log(coinData);
    applyUpdate(coinData);
});
poloniex.connect(updateEmitter);
bittrex.connect(updateEmitter);

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
            if (bestAskForCoin.get(coin).exchange == exchange) {
                console.log(`   coin: ${coin} ask: ${priceInfo[coin]} **Best Value**`)
            } else {
                console.log(`   coin: ${coin} ask: ${priceInfo[coin]} `)
            }
        }
        console.log('-------------------------------------------------')
    }
    console.log('*****************************************************')
    console.log('')
    console.log('')
}