"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

require("babel-core/register");
require("babel-polyfill");
var express = require('express');
var poloniex = require('./poloniex/poloniex');
var bittrex = require('./bittrex/bittrex');
var btc_e = require('./btc_e/btc_e');
var hbs = require('hbs');
var output = require('./output/output');

var _require = require('events'),
    EventEmitter = _require.EventEmitter;

var port = process.env.PORT || 3000;
var updateEmitter = new EventEmitter();
var app = express();

// set up view engine and serve style files
hbs.registerPartials(__dirname + '/../views/partials');
app.set('view engine', 'hbs');
app.use(express.static('style'));

// subscribe to the update event
updateEmitter.on('update', function (coinData) {
  applyUpdate(coinData);
});
poloniex.connect(updateEmitter);
bittrex.connect(updateEmitter);
btc_e.connect(updateEmitter);

// map to store current state of prices across exchanges
var priceMap = new Map();

/**
 * Update the price map
 * @param {Object} update containing an exchange and price info
 */
var applyUpdate = function applyUpdate(update) {
  priceMap.set(update.exchange, update.priceInfo);

  // rerender the output table
  output.outputTable(priceMap, getBestAskForCoins());
};

/**
 * Calculates which exchange has the best price for each coin
 * @return {Map} map of coin symbol to price and exchange
 */
var getBestAskForCoins = function getBestAskForCoins() {

  // map of coin to {exchange, ask}
  var bestAskPerCoin = new Map();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = priceMap.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref = _step.value;

      var _ref2 = _slicedToArray(_ref, 2);

      var exchange = _ref2[0];
      var priceInfo = _ref2[1];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.keys(priceInfo)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var coin = _step2.value;

          // if its the first one we find or its lowest price so far
          if (!bestAskPerCoin.get(coin) || priceInfo[coin] < bestAskPerCoin.get(coin).ask) {
            bestAskPerCoin.set(coin, {
              exchange: exchange,
              ask: priceInfo[coin]
            });
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return bestAskPerCoin;
};

/**
 * Serves up the landing page with price info
 */
app.get('/', function (req, res) {

  var bestAsk = getBestAskForCoins();
  res.render('index.hbs', {
    bittrex: output.cardDataForExchange(priceMap, 'bittrex', bestAsk),
    poloniex: output.cardDataForExchange(priceMap, 'poloniex', bestAsk),
    btc_e: output.cardDataForExchange(priceMap, 'btc-e', bestAsk)
  });
});

/**
 * Returns all the price information as a json payload
 * @return {JSON} price data
 */
app.get('/all', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify([].concat(_toConsumableArray(priceMap)), undefined, 2));
});

/**
 * Returns the exchange and price of the best deal for each coin
 * @return {JSON} best price data
 */
app.get('/best', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify([].concat(_toConsumableArray(getBestAskForCoins())), undefined, 2));
});

// start listening on port {port}
app.listen(port, function () {
  console.log("Server is up on port " + port);
});

module.exports = {
  app: app
};