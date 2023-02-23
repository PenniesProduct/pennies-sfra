/* eslint-env jquery */
'use strict';

/**
 * the function to refresh banner
 */
function refreshBanner() {
    if ($('#penniesMainContainer').length > 0) {
        var refreshPenniesBannerUrl = $('#displaypennies').data('penniesurl');
        $.ajax({
            dataType: 'html',
            url: refreshPenniesBannerUrl
        })
        .done(function (response) {
            $('#penniesMainContainer').html($(response));
        });
    }
}

/**
 * updates the totals
 * @param {Object} penniesDonation donation info
 */
function updateTotals(penniesDonation) {
    if (penniesDonation) {
        if (penniesDonation.donationAmount !== 0) {
            $('.donation-item').show();
            $('.donation-total').text(penniesDonation.donationDisplayAmount);
        } else {
            $('.donation-item').hide();
        }
        if (penniesDonation.shippingPriceExclDonationAmount !== 0) {
            $('.shipping-total-cost').text(penniesDonation.shippingPriceExclDonationAmount);
        }
        $('.grand-total-sum').text(penniesDonation.grandTotal);
    } else {
        $('.donation-item').hide();
    }
    refreshBanner();
}

/**
 * the function to donate pennies
 * donate button
 */
function donateToPennies() {
    if ($('span#penniesInviteBtn').length > 0) {
        var donateToPenniesUrl = $('span#penniesInviteBtn').data('inviteurl');
        $.spinner().start();
        $.ajax({
            dataType: 'json',
            url: donateToPenniesUrl
        })
            .done(function (data) {
                updateTotals(data.penniesDonation);
                $.spinner().stop();
            })
                .fail(function () {
                    $.spinner().stop();
                });
    }
}

/**
 * the function to remove donation pennies
 * remove button
 */
function removeDonation() {
    if ($('span#penniesRemoveBtn').length > 0) {
        var removePenniesDonationUrl = $('span#penniesRemoveBtn').data('removeurl');
        $.spinner().start();
        $.ajax({
            dataType: 'json',
            url: removePenniesDonationUrl
        })
            .done(function (data) {
                if (data.status === 1) {
                    updateTotals(data.penniesDonation);
                }
                $.spinner().stop();
            })
            .fail(function () {
                $.spinner().stop();
            });
    }
}

/**
 * re-renders the order totals and the number of items in the cart
 * @param {Object} data - AJAX response from the server
 */
function updateCartTotal() {
    var url = $('#displaypennies').attr('data-summaryurl');
    if ($('#displaypennies').length > 0) {
        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                if (!response.error) {
                    var penniesDonation = response.penniesDonation;
                    if (penniesDonation.donationAmount !== 0) {
                        $('.donation-item').show();
                        $('.donation-total').text(penniesDonation.donationDisplayAmount);
                    } else {
                        $('.donation-item').hide();
                    }
                    if (penniesDonation.shippingPriceExclDonationAmount !== 0) {
                        $('.shipping-cost').text(penniesDonation.shippingPriceExclDonationAmount);
                    }
                } else {
                    $('.donation-item').hide();
                }
            }
        });
    }
}
/**
 * re-renders the order totals and the number of items in the cart after cart update actions
 */
function checkCartUpdates() {
    var exitCount = 0;
    var checkCartUpdate = setInterval(function next() {
        exitCount++;
        if (!$('.totals').find('div').hasClass('veil')) {
            clearInterval(checkCartUpdate);
            updateCartTotal();
        }
        if (exitCount === 3) {
            clearInterval(checkCartUpdate);
            exitCount = 0;
        }
    }, 500);
}
/**
 * re-renders the order totals and the number of items in the cart after cart update actions
 */
function checkCartActionUpdates() {
    var exitCount = 0;
    var checkCartUpdate = setInterval(function next() {
        exitCount++;
        if (!$('body').find('div').hasClass('veil')) {
            clearInterval(checkCartUpdate);
            updateCartTotal();
        }
        if (exitCount === 3) {
            clearInterval(checkCartUpdate);
            exitCount = 0;
        }
    }, 500);
}
module.exports = {
    init: function () {
        $('body').on('click', 'span#penniesRemoveBtn', removeDonation);
        $('body').on('click', 'span#penniesInviteBtn', donateToPennies);
    },
    refreshBannerInfo: function () {
        refreshBanner();
    },
    updateCheckoutView: function () {
        $('body').bind('checkout:updateCheckoutView', function (e, data) {
            updateTotals(data.order.penniesDonation);
        });
    },
    update: function () {
        $('body').bind('cart:update', function () {
            updateCartTotal();
        });
        $('.shippingMethods').bind('change', function () {
            checkCartUpdates();
        });
        $('.promo-code-form').bind('submit', function () {
            checkCartActionUpdates();
        });
        $('.delete-coupon-confirmation-btn').bind('click', function () {
            checkCartActionUpdates();
        });
    }
};
