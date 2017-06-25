'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var rp = require('request-promise');

/**
 * parse out the ask (price) from the response object
 * @param {Object} response bittrex response
 * @return {Number} price
 */
var parse = function parse(response) {
  return response.result.Ask;
};

/**
 * fetch the price info for a single coin pair
 * @param {String} coin which coin pair to get data for
 * @return {Promise} price data
 */
var fetch = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(coin) {
    var options, coinData;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = {
              uri: 'https://bittrex.com/api/v1.1/public/getticker?market=' + coin,
              json: true
            };
            _context.next = 3;
            return rp(options);

          case 3:
            coinData = _context.sent;
            return _context.abrupt('return', parse(coinData));

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetch(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Bittrex only supports fetching data for one pair at a time so
 * kick off those requests in parallel
 * @param {Object} update containing an exchange and price info
 * @return {Object} Dictionary of coin symbol to its price
 */
var fetchCoinData = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var eth, dash, ltc, p;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            eth = fetch('BTC-ETH');
            dash = fetch('BTC-DASH');
            ltc = fetch('BTC-LTC');
            _context2.next = 5;
            return Promise.all([eth, dash, ltc]);

          case 5:
            p = _context2.sent;
            return _context2.abrupt('return', {
              exchange: 'bittrex',
              priceInfo: {
                ETH: p[0],
                DASH: p[1],
                LTC: p[2]
              }
            });

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchCoinData() {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Create a reccuring request to bittrex that executes every 5 seconds
 * @param {EventEmitter} emitter event emitter for signaling updates
 */
var connect = function connect(emitter) {
  console.log('connecting to Bittrex');

  setInterval(function () {
    fetchCoinData().then(function (coinData) {
      return emitter.emit('update', coinData);
    }).catch(function (e) {
      return console.log(e, 'error fetching data for bittrex. Retrying...');
    });
  }, 5000);
};

module.exports = {
  connect: connect
};