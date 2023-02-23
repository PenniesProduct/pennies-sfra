'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

var checkoutShippingServices = module.superModule;

server.extend(checkoutShippingServices);

server.prepend('UpdateShippingMethodsList', server.middleware.https, function (req, res, next) {
    // Pennies Changes : START - Skipping pennies monitor basket when looping through applicable shipping methods
    req.session.privacyCache.set('skipPenniesMonitorBasket', true);
    // Pennies Changes : END - Skipping pennies monitor basket when looping through applicable shipping methods
    return next();
});

server.append('UpdateShippingMethodsList', server.middleware.https, function (req, res, next) {
    // Pennies Changes : START - Resetting skipMonitorBasket value in request to calculate value
    req.session.privacyCache.set('skipPenniesMonitorBasket', false);
    // Pennies Changes : END - Resetting skipMonitorBasket value in request to calculate value
    return next();
});

server.append('SelectShippingMethod', server.middleware.https, function (req, res, next) {
    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();
        var order = viewData.order;
        if (order) {
            var BasketMgr = require('dw/order/BasketMgr');
            var currentBasket = BasketMgr.getCurrentBasket();
            var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
            var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
            var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(currentBasket);
            var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
            viewData.order.penniesDonation = {
                donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
                donationAmount: donationAmount.value,
                shippingPriceExclDonation: shippingPriceExclDonation,
                shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode),
                grandTotal: order.totals.grandTotal
            };
            res.setViewData(viewData);
        }
    });
    return next();
});

/**
 * Handle Ajax shipping form submit
 */
server.append(
    'SubmitShipping',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var viewData = res.getViewData();
            if (!viewData.error) {
                var BasketMgr = require('dw/order/BasketMgr');
                var currentBasket = BasketMgr.getCurrentBasket();
                var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
                var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
                var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(currentBasket);
                var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
                var order = viewData.order;
                viewData.order.penniesDonation = {
                    donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
                    donationAmount: donationAmount.value,
                    shippingPriceExclDonation: shippingPriceExclDonation,
                    shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode),
                    grandTotal: order.totals.grandTotal
                };
                res.setViewData(viewData);
            }
        });
        return next();
    }
);


module.exports = server.exports();
