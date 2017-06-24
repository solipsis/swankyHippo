const express = require('express');
const poloniex = require('./poloniex/poloniex');
const bittrex = require('./bittrex/bittrex');
const {EventEmitter} = require('events');

const updateEmitter = new EventEmitter();
app = express();

app.listen(3000, () => {
    console.log('Server is up on port 3000')
});



//const poloniexUpdater = poloniex.updateEmitter;
// poloniexUpdater.on('update', (coinData) => {
//     console.log('polo update ', coinData)
// });
updateEmitter.on('update', (coinData) => {
    console.log(coinData);
});
poloniex.connect(updateEmitter);
bittrex.connect(updateEmitter);

