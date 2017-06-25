'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var rp = require('request-promise');

// options for request to BTC-E
var options = {
  uri: 'https://btc-e.com/api/3/ticker/eth_btc-dsh_btc-ltc_btc',
  json: true
};

/**
 * extract the pairs from a btc_e response and return them
 * mapped to the price
 * @param {JSON} coinData response
 * @return {Object} Dictionary of coin symbol to its price
 */
var process = function process(coinData) {
  var eth_btc = coinData.eth_btc,
      dsh_btc = coinData.dsh_btc,
      ltc_btc = coinData.ltc_btc;

  return {
    exchange: 'btc-e',
    priceInfo: {
      ETH: eth_btc.buy,
      DASH: dsh_btc.buy,
      LTC: ltc_btc.buy
    }
  };
};

/**
 * request the pair data from btc-e and the parse
 * @param {Object} update containing an exchange and price info
 * @return {Object} Dictionary of coin symbol to its price
 */
var fetchData = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var results;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return rp(options);

          case 2:
            results = _context.sent;
            return _context.abrupt('return', process(results));

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
 * Create a reccuring request to fetch BTC-E pair data
 * and notify upon updates
 * @param {EventEmitter} emitter notify listeners of updates
 */
var connect = function connect(emitter) {
  console.log('Connecting to btc-e');
  setInterval(function () {
    fetchData().then(function (coinData) {
      emitter.emit('update', coinData);
    }).catch(function () {
      console.log('failed to fetch btc_e data. Retrying...');
    });
  }, 5000);
};

module.exports = {
  connect: connect,
  process: process
};