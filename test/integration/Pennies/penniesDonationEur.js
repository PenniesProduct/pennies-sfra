var assert = require('chai').assert;
var chaiSubset = require('chai-subset');
var chai = require('chai');
chai.use(chaiSubset);

var request = require('request-promise');
var config = require('../eur.config');

describe('check Pennies Donation  Flow', function () {
    var cookieJar = request.jar();
    var csrfGenerateRequest = {
        url: config.baseUrl + '/CSRF-Generate',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        form: {},
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var addProductToCartRequest = {
        url: config.baseUrl + '/Cart-AddProduct',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        form: {
            pid: '701644329402M',
            quantity: 1,
            options: []
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var displayDonationRequest = {
        url: config.baseUrl + '/Pennies-DisplayBanner',
        method: 'GET',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        form: {},
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var addDonationRequest = {
        url: config.baseUrl + '/Pennies-AddDonation',
        method: 'GET',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        form: {},
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var removeDonationRequest = {
        url: config.baseUrl + '/Pennies-RemoveDonation',
        method: 'GET',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        form: {},
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var csrfJsonResponse = {};

    it('should create a Pennies donation and then remove donation ', function () {
        this.timeout(200000);
        // step1 : product add to cart
        return request(addProductToCartRequest)
        .then(function (response) {
            assert.equal(response.statusCode, 200, 'Expected POST Cart-AddProduct call statusCode to be 200.');
            var nextRequest = csrfGenerateRequest;
            var cookieString = cookieJar.getCookieString(addProductToCartRequest.url);
            var cookie = request.cookie(cookieString);
            cookieJar.setCookie(cookie, addProductToCartRequest.url);
            // step2 : get cookies, Generate CSRF, then set cookies
            return request(nextRequest);
        })
        .then(function (response) {
            assert.equal(response.statusCode, 200, 'Expected POST CSRF-Generate call statusCode to be 200.');
            var nextRequest = displayDonationRequest;
            csrfJsonResponse = JSON.parse(response.body);
            // step3 : calculate donation amount
            nextRequest.url += '?' +
                csrfJsonResponse.csrf.tokenName + '=' +
                csrfJsonResponse.csrf.token;
            return request(nextRequest);
        })
        .then(function (response) {
            assert.equal(response.statusCode, 200, 'Expected GET Pennies-DisplayBanner call statusCode to be 200.');
            var nextRequest = addDonationRequest;
            // step4 : add donation
            nextRequest.url += '?' +
                csrfJsonResponse.csrf.tokenName + '=' +
                csrfJsonResponse.csrf.token;
            return request(nextRequest);
        })
        .then(function (response) {
            assert.equal(response.statusCode, 200, 'Expected GET Pennies-AddDonation call statusCode to be 200.');
            var penniesDonation = JSON.parse(response.body);
            // console.log(penniesDonation.penniesDonation.donationAmount);
            assert.isNumber(penniesDonation.penniesDonation.donationAmount, 'Expected GET Pennies-AddDonation call donation amount to be a number');
            var nextRequest = removeDonationRequest;
            // step5 : remove donation
            nextRequest.url += '?' +
                csrfJsonResponse.csrf.tokenName + '=' +
                csrfJsonResponse.csrf.token;
            return request(nextRequest);
        })
        .then(function (response) {
            assert.equal(response.statusCode, 200, 'Expected GET Pennies-RemoveDonation call statusCode to be 200.');
            var penniesDonation = JSON.parse(response.body);
            assert.equal(penniesDonation.penniesDonation.donationAmount, 0, 'Expected  GET Pennies-RemoveDonation call donation amount to be 0');
        });
    });
});
