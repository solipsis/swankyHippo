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
});
poloniex.connect(updateEmitter);
bittrex.connect(updateEmitter);

let applyUpdate = () => {

}