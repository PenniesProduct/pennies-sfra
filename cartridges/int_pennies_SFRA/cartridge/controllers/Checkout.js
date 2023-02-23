'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

var checkout = module.superModule;

server.extend(checkout);

// Main entry point for Checkout

server.append('Begin',
        server.middleware.https,
        consentTracking.consent,
        csrfProtection.generateToken,
        function (req, res, next) {
            var viewData = res.getViewData();
            if (viewData.order) {
                var BasketMgr = require('dw/order/BasketMgr');
                var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
                var currentBasket = BasketMgr.getCurrentBasket();
                var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
                var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(currentBasket);
                var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
                viewData.order.penniesDonation = {
                    donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
                    donationAmount: donationAmount.value,
                    shippingPriceExclDonation: shippingPriceExclDonation,
                    shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode)
                };
                res.setViewData(viewData);
            }
            next();
        });


module.exports = server.exports();
