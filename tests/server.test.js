const polyfill = require('babel-polyfill');
const request = require('supertest');
const expect = require('expect');
const poloniex = require('../src/poloniex/poloniex');
const btc_e = require('../src/btc_e/btc_e');

var app = require('../src/server');

describe('Server', () => {
  it('should get the best value for each coin', () => {
    app.priceMap.set('poloniex', {
      ETH: 0.11828999,
      DASH: 0.0692214,
      LTC: 0.0166
    });

    app.priceMap.set('bittrex', {
      ETH: 0.1188,
      DASH: 0.0692397,
      LTC: 0.01663989
    });
    app.priceMap.set('btc-e', {
      ETH: 0.11885,
      DASH: 0.06915,
      LTC: 0.01664
    });
    const best = app.getBestAskForCoins();

    expect(best.size).toBe(3);
    expect(best.get('ETH').exchange).toBe('poloniex');
    expect(best.get('DASH').exchange).toBe('btc-e');
  })
})

describe('BTC-E', () => {
  it('should parse the buy field for all coins', () => {
    const resp = {
      eth_btc: {
        high: 0.12181,
        low: 0.116,
        avg: 0.118905,
        vol: 940.44565,
        vol_cur: 7849.80734,
        last: 0.11815,
        buy: 0.11855,
        sell: 0.11815,
        updated: 1498377056
      },
      dsh_btc: {
        high: 0.06979,
        low: 0.06795,
        avg: 0.06887,
        vol: 132.24704,
        vol_cur: 1918.3378,
        last: 0.06872,
        buy: 0.06886,
        sell: 0.06869,
        updated: 1498377056
      },
      ltc_btc: {
        high: 0.01692,
        low: 0.01633,
        avg: 0.016625,
        vol: 751.02085,
        vol_cur: 45268.56124,
        last: 0.01669,
        buy: 0.01669,
        sell: 0.01663,
        updated: 1498377056
      }
    }




    const result = btc_e.process(resp);

    expect(result.exchange).toBe('btc-e');
    expect(result.priceInfo.ETH).toBe(0.11855).toBeA('number')
    expect(result.priceInfo.DASH).toBe(0.06886).toBeA('number')
    expect(result.priceInfo.LTC).toBe(0.01669).toBeA('number')

  })
})

describe('Poloniex', () => {
  it('should parse the lowest ask', () => {
    const coinPair = {
      last: 0.0251,
      lowestAsk: 0.02589999,
      highestBid: 0.0251,
      percentChange: 0.02390438,
      baseVolume: 6.16485315,
      quoteVolume: 245.82513926
    };

    const price = poloniex.parsePrice(coinPair);
    expect(price).toBe(0.02589999).toBeA('number');
  });


  const resp = {
    BTC_ETH: {
      id: 185,
      last: 0.00023500,
      lowestAsk: 0.00023569,
      highestBid: 0.00023501,
      percentChange: -0.03036804,
    },
    BTC_LTC: {
      id: 186,
      last: 0.00195280,
      lowestAsk: 0.00197164,
      highestBid: 0.00195280,
      percentChange: -0.02573850,
    },
    BTC_GNO: {
      id: 187,
      last: 0.08350001,
      lowestAsk: 0.08350001,
      highestBid: 0.08350000,
      percentChange: -0.01764694,
    },
    BTC_DASH: {
      id: 188,
      last: 0.69819027,
      lowestAsk: 0.69938121,
      highestBid: 0.69819027,
      percentChange: -0.00090996,
    }
  };

  it('should fetch the ask price for eth, dash, and ltc', () => {

    const coinData = poloniex.process(resp);

    expect(coinData.priceInfo.ETH).toBe(0.00023569).toBeA('number');
    expect(coinData.priceInfo.DASH).toBe(0.69938121).toBeA('number');
    expect(coinData.priceInfo.LTC).toBe(0.00197164).toBeA('number');
  });

  it('should not include other currency pairs', () => {
    const coinData = poloniex.process(resp);
    expect(Object.keys(coinData.priceInfo).length).toBe(3);
  });

});
