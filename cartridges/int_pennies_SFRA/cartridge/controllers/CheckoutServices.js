'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

var checkoutServices = module.superModule;
server.extend(checkoutServices);

/**
 * Handle Ajax payment form submit with pennies donation
 */
server.append(
         'SubmitPayment',
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


server.append('PlaceOrder', server.middleware.https, function (req, res, next) {
    var libPennies = require('*/cartridge/scripts/common/libPennies');
    var viewData = res.getViewData();
    if (!viewData.error) {
        var OrderMgr = require('dw/order/OrderMgr');
        var order = OrderMgr.getOrder(viewData.orderID);
        var penniesdonation = order.defaultShipment.getShippingLineItem('PENNIES_DONATION');
        // Pennies Changes : START - Update pennies donation details on order
        libPennies.updatePenniesDonationDetailsOnOrder(order);
        // Pennies Changes : END - Update pennies donation details on order
        // Pennies Changes : START - Mark donation ready for export
        libPennies.markDonationReadyForExport(order);
        // Pennies Changes : END - Mark donation ready for export
        viewData.penniesDonation = (penniesdonation !== null) ? penniesdonation.price.value : null;
        res.setViewData(viewData);
    }
    return next();
});


module.exports = server.exports();
