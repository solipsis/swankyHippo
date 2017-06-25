'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Outputs a table of all price data to the console
 * @param {Map} priceMap map of exchanges to their price data
 * @param {Map} bestAskForCoin a map of a coin symbol to its best price
 */
var outputTable = function outputTable(priceMap, bestAskForCoin) {
  console.log('');
  console.log('');
  console.log('*****************************************************');

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = priceMap.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref = _step.value;

      var _ref2 = _slicedToArray(_ref, 2);

      var exchange = _ref2[0];
      var priceInfo = _ref2[1];

      console.log('* ' + exchange + ' | ');
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.keys(priceInfo)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var coin = _step2.value;

          // add some padding to make the table pretty
          var paddedCoin = String('     ' + coin).slice(-5);
          var paddedAsk = String('        ' + priceInfo[coin].toPrecision(5)).slice(-8);

          // if not the best value show potential loss
          if (bestAskForCoin.get(coin).exchange === exchange) {
            console.log('   coin: ' + paddedCoin + '   ask(BTC): ' + paddedAsk + ' **Best Value**');
          } else {
            var BTC = 20; // how many bitcoins to convert

            // In a more robust solution you would probably want to use order books
            // to look at the market depth because a fair amount of slippage could
            // occur with an order of 20 bitcoins
            var loss = priceInfo[coin] * BTC - bestAskForCoin.get(coin).ask * BTC;
            console.log('   coin: ' + paddedCoin + '   ask(BTC): ' + paddedAsk + ' worse_deal_by: ~' + loss.toPrecision(5) + ' ' + coin + ' ');
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

      console.log('-------------------------------------------------');
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

  console.log('*****************************************************');
  console.log('');
  console.log('');
};

/**
 * Formats price data for an exchange into a Format
 * better for the template engine
 * @param {Object} priceMap map of echanges to their coins and prices
 * @param {String} exchange which exchange to create cards for
 * @param {Object} bestAsk map of coin pairs to their best price and exchange
 * @return {Object} cardData map of coin symbol to card info
 */
function cardDataForExchange(priceMap, exchange, bestAsk) {
  var cardData = {};

  // if we don't have data for this exchange return
  var priceData = priceMap.get(exchange);
  if (!priceData) {
    return undefined;
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = Object.keys(priceData)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var coin = _step3.value;

      var BTC = 20; // how many bitcoins to convert
      var loss = (priceData[coin] * BTC - bestAsk.get(coin).ask * BTC).toPrecision(4);

      cardData[coin] = {
        ask: priceData[coin],
        best: bestAsk.get(coin).exchange === exchange,
        loss: String(loss + (' ' + coin))
      };
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return cardData;
}

module.exports = {
  cardDataForExchange: cardDataForExchange,
  outputTable: outputTable
};