'use strict';

var server = require('server');

var libPennies = require('*/cartridge/scripts/common/libPennies');
var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
var PenniesApi = require('*/cartridge/scripts/libPenniesAPI');
var Site = require('dw/system/Site');
/**
 * This function gets the pennies banner contents.
 * Gets the cart model. If the donation is already added display - Thank you banner.
 * If not, then calculate the donation amount based on basket total and if donation
 * amount is greater than 0 then display Invite to donate banner else Pennies Inform banner
 */
server.get('DisplayBanner', server.middleware.https, function (req, res, next) {
    var accountDetails = PenniesApi.getAccountDetails();
    if (Site.current.getCustomPreferenceValue('penniesDonationIntegrationEnabled') && (req.session.currency.currencyCode == 'GBP' || req.session.currency.currencyCode == 'EUR' || req.session.currency.currencyCode == 'USD')) {
        if (accountDetails.penniesAccessToken === null || accountDetails.penniesMerchantID === null) {
            res.render('banners/penniesemptybanner', {});
        } else {
            var BasketMgr = require('dw/order/BasketMgr');
            libPennies.getCharityDetails();
            var currentBasket = BasketMgr.getCurrentBasket();
            var renderingTemplate = libPennies.displayPenniesBanner();
            var donationDisplayAmount = null;
            var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
            var solicitationMessage = PenniesUtil.getSolicitationMessage();
            if (donationAmount !== null) {
                donationDisplayAmount = PenniesUtil.getDonationDisplayAmount(donationAmount.value);
            }

            res.render(renderingTemplate, {
                CharityName: PenniesUtil.getCharityNames(),
                CharityTitle: PenniesUtil.getCharityTitle(),
                CharityHeading: PenniesUtil.getCharityHeading(),
                CharityUrl: PenniesUtil.getCharityUrl(),
                CharityLogo: PenniesUtil.getCharityLogoId(),
                CharitySoundBite: PenniesUtil.getCharitySoundBite(),
                displayDonationAmount: PenniesUtil.getDonationDisplayAmount(req.session.privacyCache.get('penniesDonationAmount')),
                donationDisplayAmount: donationDisplayAmount,
                solicitationMessage: solicitationMessage
            });
        }
    } else {
        res.render('banners/penniesemptybanner', {});
    }
    next();
});

/**
 * This function is invoked when user clicks on the Donate button in the Invite to donate banner.
 * Gets the cart model. In a transaction invokes the util function to add the donation
 * to basket. Gets the new banner contents.
 */
server.get('AddDonation', server.middleware.https, function (req, res, next) {
    if (Site.current.getCustomPreferenceValue('penniesDonationIntegrationEnabled') && (req.session.currency.currencyCode == 'GBP' || req.session.currency.currencyCode == 'EUR' || req.session.currency.currencyCode == 'USD')) {
        var BasketMgr = require('dw/order/BasketMgr');
        var currentBasket = BasketMgr.getCurrentBasket();
        var Transaction = require('dw/system/Transaction');
        if (!currentBasket) {
            res.json({
                penniesDonation: null
            });
            return next();
        }
        Transaction.wrap(function () {
            libPennies.addDonationToBasket(req.session.privacyCache.get('penniesDonationAmount'));
        });
        var OrderModel = require('*/cartridge/models/order');
        var order = new OrderModel(currentBasket, { containerView: 'basket' });
        var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
        var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(currentBasket);
        var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
        var penniesDonation = {
            donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
            donationAmount: donationAmount.value,
            shippingPriceExclDonation: shippingPriceExclDonation.value,
            shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode),
            grandTotal: order.totals.grandTotal
        };
        res.json({
            penniesDonation: penniesDonation
        });
    }
    return next();
});

/**
 * This function is invoked when user clicks on the Remove button in the Thank you banner.
 * Gets the cart model. In a transaction invokes the util function to remove the donation
 * from basket. Gets the new banner contents.
 */
server.get('RemoveDonation', server.middleware.https, function (req, res, next) {
    if (Site.current.getCustomPreferenceValue('penniesDonationIntegrationEnabled') && (req.session.currency.currencyCode == 'GBP' || req.session.currency.currencyCode == 'EUR' || req.session.currency.currencyCode == 'USD')) {

        var process = 0;
        var BasketMgr = require('dw/order/BasketMgr');
        var Transaction = require('dw/system/Transaction');
        var currentBasket = BasketMgr.getCurrentBasket();
        if (!currentBasket) {
            res.json({
                status: process,
                penniesDonation: null
            });
            return next();
        }
        Transaction.wrap(function () {
            libPennies.removeDonationFromBasket();
            process = 1;
        });
        var OrderModel = require('*/cartridge/models/order');
        var order = new OrderModel(currentBasket, { containerView: 'basket' });
        var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
        var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(currentBasket);
        var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
        var penniesDonation = {
            donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
            donationAmount: donationAmount.value,
            shippingPriceExclDonation: shippingPriceExclDonation.value,
            shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode),
            grandTotal: order.totals.grandTotal
        };
        res.json({
            status: process,
            penniesDonation: penniesDonation
        });
    }
    return next();
});

/**
 * This function is updated order total summary with pennies donation amount
 */
server.get('UpdateSummary', server.middleware.https, function (req, res, next) {
    if (Site.current.getCustomPreferenceValue('penniesDonationIntegrationEnabled') && (req.session.currency.currencyCode == 'GBP' || req.session.currency.currencyCode == 'EUR' || req.session.currency.currencyCode == 'USD')) {
        var BasketMgr = require('dw/order/BasketMgr');
        var currentBasket = BasketMgr.getCurrentBasket();
        var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
        var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(currentBasket);
        var donationAmount = PenniesUtil.getPenniesDonationAmount(currentBasket);
        var penniesDonation = {
            donationDisplayAmount: formatCurrency(donationAmount.value, req.session.currency.currencyCode),
            donationAmount: donationAmount.value,
            shippingPriceExclDonation: shippingPriceExclDonation.value,
            shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, req.session.currency.currencyCode)
        };
        res.json({
            penniesDonation: penniesDonation
        });
    } else {
        res.json({
            error: true
        });
    }
    return next();
});

module.exports = server.exports();
