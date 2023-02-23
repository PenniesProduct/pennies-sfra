'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var Order = module.superModule;
server.extend(Order);

server.append(
    'Confirm',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var viewData = res.getViewData();
        if (viewData.order) {
            var OrderMgr = require('dw/order/OrderMgr');
            var order = OrderMgr.getOrder(req.querystring.ID);
            var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
            var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
            var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(order);
            var donationAmount = PenniesUtil.getPenniesDonationAmount(order);
            viewData.order.penniesDonation = {
                donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
                donationAmount: donationAmount.value,
                shippingPriceExclDonation: shippingPriceExclDonation,
                shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode)
            };
            res.setViewData(viewData);
        }
        return next();
    }
);

server.append(
    'Details',
    consentTracking.consent,
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var viewData = res.getViewData();
        if (viewData.order) {
            var OrderMgr = require('dw/order/OrderMgr');
            var order = OrderMgr.getOrder(req.querystring.orderID);
            var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
            var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
            var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(order);
            var donationAmount = PenniesUtil.getPenniesDonationAmount(order);
            viewData.order.penniesDonation = {
                donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
                donationAmount: donationAmount.value,
                shippingPriceExclDonation: shippingPriceExclDonation,
                shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode)
            };
            res.setViewData(viewData);
        }
        return next();
    }
);
server.append(
    'Track',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.validateRequest,
    csrfProtection.generateToken,
    function (req, res, next) {
        var viewData = res.getViewData();
        if (viewData.order) {
            var OrderMgr = require('dw/order/OrderMgr');
            var order = OrderMgr.getOrder(req.querystring.trackOrderNumber);
            var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
            var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
            var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(order);
            var donationAmount = PenniesUtil.getPenniesDonationAmount(order);
            viewData.order.penniesDonation = {
                donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
                donationAmount: donationAmount.value,
                shippingPriceExclDonation: shippingPriceExclDonation,
                shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode)
            };
            res.setViewData(viewData);
        }
        return next();
    }
);

module.exports = server.exports();
