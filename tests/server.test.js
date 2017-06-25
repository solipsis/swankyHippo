const polyfill = require('babel-polyfill');
const request = require('supertest');
const expect = require('expect');
const poloniex = require('../src/poloniex/poloniex');

var app = require('../src/server');

describe('Poloniex', () => {
    it('should parse the lowest ask', () => {
        const coinPair = {last:0.0251,lowestAsk:0.02589999,highestBid:0.0251,percentChange:0.02390438,
        baseVolume:6.16485315,quoteVolume:245.82513926};

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
            BTC_DASH: 
            { id: 188,
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

