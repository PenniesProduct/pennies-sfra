'use strict';

/**
 * Model for pennies functionality. Creates a PenniesModel class with helper methods.
 * @module util/PenniesUtil
 */

/* Script Modules */

var Money = require('dw/value/Money');
var BasketMgr = require('dw/order/BasketMgr');

var PenniesUtil = {};

/**
 * 
 * This function calculates the shipping price without the donation amount in it if the donation is
 * added to the basket. This is mainly used for display purposes in order summary.
 * 
 */
PenniesUtil.getShippingPriceExcludingDonation = function(lineItemCtnr : dw.order.LineItemCtnr) {
	
	var shippingPriceExclDonation = Money.NOT_AVAILABLE;
	
	if(lineItemCtnr.shippingTotalPrice.available) {
			
		shippingPriceExclDonation = lineItemCtnr.shippingTotalPrice;
		
		var donationAmount = this.getPenniesDonationAmount(lineItemCtnr);
		if(donationAmount != null && donationAmount.available) {
		
			shippingPriceExclDonation = lineItemCtnr.shippingTotalPrice.subtract(donationAmount);
			
		}
	}
	
	return shippingPriceExclDonation;
}


/**
 * 
 * This function gets the pennies donation amount.
 * If the orderId parameter is not empty then the donation details are picked from the
 * order else its picked from the session
 */
PenniesUtil.getPenniesDonationAmount = function(lineItemCtnr : dw.order.LineItemCtnr) {
	
	var donationAmount = Money.NOT_AVAILABLE;
	
	if(!empty(lineItemCtnr)) {
		
		var penniesSLI = lineItemCtnr.defaultShipment.getShippingLineItem('PENNIES_DONATION');
		if(penniesSLI != null) {
		
			donationAmount = penniesSLI.price;
		}
	} 
	
	return donationAmount;
	
}

/**
 * This function returns the pennies charity names returned by the API call which is set in the session.
 * This value is used to display in the pennies banners.
 */
PenniesUtil.getCharityNames = function() {
	
	var charityNames = '';
	
	if(!empty(session.privacy.penniesCharities)) {
		
		var charities = JSON.parse(session.privacy.penniesCharities);
		charityNames = charities.map(function(charity) {
							return charity.name;
						}).join(",");
	}
	
	return charityNames;
}

/**
 * This function returns the charity logo id to be used in constructing the charity logo image
 * url. The first charity id set in the api response is used to generate the logo url
 */
PenniesUtil.getCharityLogoId = function() {
	
	var charityLogoId = '';
	
	if(!empty(session.privacy.penniesCharities)) {
		
		var charities = JSON.parse(session.privacy.penniesCharities);
		charityLogoId = charities[0].id
	}
	
	return charityLogoId;
}


/**
 * This function checks if the pennies donation has been added to the line item container
 */
PenniesUtil.isDonationAdded = function(lineItemCtnr : dw.order.LineItemCtnr) {
	
	var donationAmount = this.getPenniesDonationAmount(lineItemCtnr);
	
	return (donationAmount != null && donationAmount.available);
}


/**
 * This function checks if the pennies donation has been added to the basket
 */
PenniesUtil.isDonationAddedInBasket = function() {
	
	var basket = this.getBasket();
	
	return this.isDonationAdded(basket);
}

/**
 * This function gets the current basket
 * 
 * @returns
 */
PenniesUtil.getBasket = function() {
	
	var basket = BasketMgr.getCurrentBasket();
	
	return basket;
}



PenniesUtil.getDonationDisplayAmount = function(donationAmount) {
	
	var displayDonationAmount = '';
	
	if(donationAmount < 1) {
			
		displayDonationAmount = (new Number(donationAmount) * 100).toFixed(0) + 'p'; 
		
	} else {
		
		displayDonationAmount = '&pound;' + new Number(donationAmount.toFixed(2));
	}
	
	return displayDonationAmount;
}


/** The PenniesUtil class */
module.exports = PenniesUtil;
 
 