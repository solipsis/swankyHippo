'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var rp = require('request-promise');

/**
 * extract the pairs from a btc_e response and return them
 * mapped to the price
 * @param {JSON} resp response
 * @return {Number} price of the lowest ask
 */
var parsePrice = function parsePrice(resp) {
  return Number(resp.lowestAsk);
};

/**
 * extract the pairs from a poloniex response and return them
 * mapped to the price
 * @param {JSON} coinData response
 * @return {Object} Dictionary of coin symbol to its price
 */
var process = function process(coinData) {
  var BTC_ETH = coinData.BTC_ETH,
      BTC_DASH = coinData.BTC_DASH,
      BTC_LTC = coinData.BTC_LTC;

  return {
    exchange: 'poloniex',
    priceInfo: {
      ETH: parsePrice(BTC_ETH),
      DASH: parsePrice(BTC_DASH),
      LTC: parsePrice(BTC_LTC)
    }
  };
};

// request options
var options = {
  uri: 'https://poloniex.com/public?command=returnTicker',
  json: true
};

/**
 * make a request to poloniex and the parse the result
 * @return {Promise} Dictionary of coin symbol to its price
 */
var fetchData = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var coinData;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return rp(options);

          case 2:
            coinData = _context.sent;
            return _context.abrupt('return', process(coinData));

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchData() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * create a recurring request to poloniex for pair data
 * @param {EventEmitter} emitter event emitter to notify of updates
 */
var connect = function connect(emitter) {
  console.log('Connecting to poloniex');

  setInterval(function () {
    fetchData().then(function (coinData) {
      return emitter.emit('update', coinData);
    }).catch(function () {
      return console.log('Error connecting to poloniex. Retrying ...');
    });
  }, 5000);
};

module.exports = {
  connect: connect,
  parsePrice: parsePrice,
  process: process
};