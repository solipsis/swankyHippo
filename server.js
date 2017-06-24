const express = require('express');
const poloniex = require('./poloniex/poloniex');
const bittrex = require('./bittrex/bittrex');
const { EventEmitter } = require('events');

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

const priceMap = {}

const applyUpdate = (update) => {
    priceMap[update.exchange] = update.priceInfo;
    console.log("Current map: ", priceMap);

    // apply map/for each function to extract best rate for each coin
};