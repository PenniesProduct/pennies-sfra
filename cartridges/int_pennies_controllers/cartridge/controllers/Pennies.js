'use strict';

/**
 * Controller that displays the pennies banner and adds/removes donation to/from basket.
 *
 * @module controllers/Pennies
 */
/* API Includes */
var Site = require( 'dw/system/Site' );

/* Script Modules */
var guard = require('*/cartridge/scripts/guard');
var app = require('*/cartridge/scripts/app');
var libPennies = require('*/cartridge/scripts/common/libPennies');
var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
var Transaction = require('dw/system/Transaction');



/**
 * This function gets the pennies banner contents.
 * 
 * Gets the cart model. If the donation is already added display - Thank you banner.
 * If not, then calculate the donation amount based on basket total and if donation
 * amount is greater than 0 then display Invite to donate banner else Pennies Inform banner
 * 
 */
function displayBanner() {
	
	var basket = PenniesUtil.getBasket();
	var renderingTemplate ='';
	if(Site.current.getCustomPreferenceValue('penniesAccessToken') == null  || Site.current.getCustomPreferenceValue('penniesMerchantID') == null ){
		renderingTemplate = 'banners/penniesemptybanner';
	}else{
		 renderingTemplate = libPennies.displayPenniesBanner();
	}
	app.getView({'basket' : basket}).render(renderingTemplate);
	
}


/**
 * This function is invoked when user clicks on the Donate button in the Invite to donate banner. 
 * 
 * Gets the cart model. In a transaction invokes the util function to add the donation
 * to basket. Gets the new banner contents. 
 * 
 */
function addDonation() {
	
	Transaction.wrap(function() {
			
		libPennies.addDonationToBasket(session.privacy.penniesDonationAmount);
	});
	
	
	displayBanner();
	
}


/**
 * This function is invoked when user clicks on the Remove button in the Thank you banner.
 * 
 * Gets the cart model. In a transaction invokes the util function to remove the donation
 * from basket. Gets the new banner contents. 
 * 
 */
function removeDonation() {
	
	Transaction.wrap(function() {
			
		libPennies.removeDonationFromBasket();
	});
	
	
	displayBanner();
}



/** Displays the appropriate pennies banner based on the session values and basket total.
 * @see {@link module:controllers/Pennies~displayBanner} */
exports.DisplayBanner = guard.ensure(['get'], displayBanner);

/** Adds the pennies donation to basket.
 * @see {@link module:controllers/Pennies~addDonation} */
exports.AddDonation = guard.ensure(['get'], addDonation);

/** Removes the pennies donation from basket.
 * @see {@link module:controllers/Pennies~removeDonation} */
exports.RemoveDonation = guard.ensure(['get'], removeDonation);


