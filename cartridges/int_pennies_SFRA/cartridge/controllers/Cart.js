'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

var cart = module.superModule;

server.extend(cart);

server.append(
    'Show',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var currentBasket = BasketMgr.getCurrentBasket();
        if (currentBasket) {
            var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
            var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
            var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(currentBasket);
            var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
            var viewData = res.getViewData();
            viewData.penniesDonation = {
                donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
                donationAmount: donationAmount,
                shippingPriceExclDonation: shippingPriceExclDonation,
                shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode)
            };
            res.setViewData(viewData);
        }

        return next();
    }
);


module.exports = server.exports();
