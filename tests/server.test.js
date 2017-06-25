const polyfill = require('babel-polyfill');
const request = require('supertest');
const expect = require('expect');
const poloniex = require('../poloniex/poloniex');

var app = require('../server');

describe('Poloniex', () => {
    it('should parse the lowest ask', () => {
        const coinPair = {"last":"0.0251","lowestAsk":"0.02589999","highestBid":"0.0251","percentChange":"0.02390438",
        "baseVolume":"6.16485315","quoteVolume":"245.82513926"};

        const price = poloniex.parsePrice(coinPair);
        expect(price).toBe(0.02589999).toBeA('number');
    }) 
})

