'use strict';

var base = module.superModule;
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
/**
 * Sends a confirmation to the current user
 * @param {dw.order.Order} order - The current user's order
 * @param {string} locale - the current request's locale id
 * @returns {void}
 */
base.sendConfirmationEmail = function (order, locale) {
    var OrderModel = require('*/cartridge/models/order');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(locale);
    var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
    var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
    var shippingPriceExclDonation = PenniesUtil.getShippingPriceExcludingDonation(order);
    var donationAmount = PenniesUtil.getPenniesDonationAmount(order);
    var currencyCode = order.currencyCode;
    var penniesDonation = {
        donationDisplayAmount: formatCurrency(donationAmount.value, currencyCode),
        donationAmount: donationAmount.value,
        shippingPriceExclDonation: shippingPriceExclDonation,
        shippingPriceExclDonationAmount: formatCurrency(shippingPriceExclDonation.value, currencyCode)
    };
    var orderModel = new OrderModel(order, { countryCode: currentLocale.country, containerView: 'order', penniesDonation: penniesDonation });
    var orderObject = { order: orderModel, penniesDonation: penniesDonation };
    var emailObj = {
        to: order.customerEmail,
        subject: Resource.msg('subject.order.confirmation.email', 'order', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
        type: emailHelpers.emailTypes.orderConfirmation
    };
    emailHelpers.sendEmail(emailObj, 'checkout/confirmation/confirmationEmail', orderObject);
};

module.exports = base;
