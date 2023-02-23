'use strict';

var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var ShippingMgr = require('dw/order/ShippingMgr');
var PenniesUtil = require('~/cartridge/scripts/util/PenniesUtil');

//We do not require CartModel.js here as libPennies.js is being required in CartModel.js within function calculate() to monitor the basket
//for changes, so to avoid an infinite loop we require this within each function as and when required


/**
 * This function gets the charity details. The charity details are retrieved to display on the
 * Inform panel banner mainly
 */
function getCharityDetails() {
	
	var libPenniesAPI = require('~/cartridge/scripts/libPenniesAPI');
	return libPenniesAPI.retrievePenniesCharityDetails();
}

/**
 * This functions invokes the PenniesAPI util which retrieves the donation amount based on the 
 * basket total
 */
function calculateDonation() {
	
	var basket = PenniesUtil.getBasket();
	
	if(basket != null) {  
	
		var libPenniesAPI = require('~/cartridge/scripts/libPenniesAPI');
		return libPenniesAPI.calculateDonation(basket);
	}
	
}


/**
 * This function adds the donation amount (passed as input parameter) into the basket as a shipping line item.
 * We add the donation amount as a shipping line item to avoid the donation being included in 
 * DW's revenue model. Shipping and Tax are exempted from DW revenue model.
 * 
 * To avoid tax from being applied on the donation shipping line item, we set the class 'exempt'
 * to this
 * 
 * The session values penniesDonationAdded and penniesBasketTotal are updated. 
 * 
 * penniesBasketTotal holds the basket total when the donation was added to basket. This is used
 * for monitoring purposes.
 * 
 * @param donationAmount
 */
function addDonationToBasket(donationAmount) {
	
	var basket = PenniesUtil.getBasket();
	
	if(basket != null && basket.defaultShipment != null && donationAmount != null) {
		
		var donationAmount  : Number =  parseFloat(donationAmount);
			
		var penniesSLI = basket.defaultShipment.getShippingLineItem('PENNIES_DONATION');
		if(penniesSLI == null)
			penniesSLI = basket.defaultShipment.createShippingLineItem('PENNIES_DONATION');
		
		basket.defaultShipment.getShippingLineItem('PENNIES_DONATION').setPriceValue(donationAmount);
		basket.defaultShipment.getShippingLineItem('PENNIES_DONATION').setTaxClassID('exempt');
		
		ShippingMgr.applyShippingCost(basket);
		
		basket.updateTotals();
		
		//We do not use CartModel.calculate() here because at this point the total gross price
		//does not contain the donation amount. Within the CartModel.calculate() we have a monitor basket function
		//which compares the current basket total after the calculate hook is called with the penniesBasketTotal value
		//in session. If the values are not the same the donation is removed. Hence to avoid this we 
		//call the hook explicitly within this js file, to avoid the donation from being removed
		//right after its added
		calculateCart(basket);
		
		session.privacy.penniesBasketTotal = basket.getTotalGrossPrice().value;
		
	}
}




/**
*
* This function removes the pennies donation shipping line item from cart and clears the values set
* in the session. We do not add Transaction.wrap to this as removeDonationFromBasket is called from monitorBasket 
* which in turn is called in CartModel.calculate() which is already under transaction.
* 
* Transaction must begin  from the invoking function
*
*/
function removeDonationFromBasket(basket) {
	
	if(basket == null) {
		
		basket = PenniesUtil.getBasket();
	}
	
	if(basket != null) {
		
		var penniesSLI = basket.defaultShipment.getShippingLineItem('PENNIES_DONATION');
		if(penniesSLI != null) {
			
			basket.defaultShipment.removeShippingLineItem(penniesSLI);
			
			clearSessionValues();
			
			ShippingMgr.applyShippingCost(basket); 
			
			basket.updateTotals();
			
			calculateCart(basket);
		}
	}
}



/**
 * 
 * This function is called within CartModel.calculate(). If at any point the basket value gets modified
 * when there is a donation in the basket, and the basket value is not equal to the session value penniesBasketTotal
 * then the donation is removed from basket and the basket is recalculated.
 * 
 */
function monitorBasketChangesForPennies(basket) {
	
	if(basket != null) {
		
		if(!PenniesUtil.isDonationAdded(basket)) return;
		
			
		//Skip if pennies is not enabled or if the currency is not GBP and remove any donations which were there in basket
		if(!dw.system.Site.current.preferences.custom.penniesDonationIntegrationEnabled || session.currency.currencyCode != 'GBP') {
		
			removeDonationFromBasket(basket);
			
			return;
		}
		
		if('skipPenniesMonitorBasket' in request.custom && request.custom.skipPenniesMonitorBasket) 
			return;
		
		if(!empty(session.privacy.skipPenniesMonitorBasket) && session.privacy.skipPenniesMonitorBasket == true){
			return;
		}
		if(!empty(session.privacy.skipPenniesMonitorBasket) && session.privacy.skipPenniesMonitorBasket == false){
			delete session.privacy.skipPenniesMonitorBasket;
		}
		
		if(('removePenniesDonation' in request.custom && request.custom.removePenniesDonation)  ||
				(session.privacy.penniesBasketTotal != basket.getTotalGrossPrice().value)) {
			
			removeDonationFromBasket(basket);
			
			request.custom.removeDonation = false;
		}
		
		
	}
	
	
}


/**
 * This function copies all the session data into the order
 *  - hashkey
 *  - charity details
 *  
 *  This also sets the status of pennies donation to either NOT DONATED or CREATED
 *  based on if a donation was made or not 
 */
function updatePenniesDonationDetailsOnOrder(order : dw.order.Order) {
	
	
	Transaction.wrap(function() {
		
		if(PenniesUtil.isDonationAdded(order)) {
			
			order.custom.penniesCharityDetails = session.privacy.penniesCharities;
			order.custom.penniesHashKey = session.privacy.penniesHashKey;
			order.custom.penniesDonationStatus = 'created';
		} else {
			
			order.custom.penniesDonationStatus = 'notdonated';
		}
		
		clearSessionValues();
	});
}

/**
 * This function marks an order which has a donation in it, ready to export
 * and updates the donation post date with the current date.
 * 
 */
function markDonationReadyForExport(order) {
	
	Transaction.wrap(function() {
		
		if(order.custom.penniesDonationStatus == 'created') {
		
			order.custom.penniesDonationStatus = 'readytoexport';
		}
	});
}



function updateShippingCosts(shippingCosts, basket) {
	
	var donationAmount = PenniesUtil.getPenniesDonationAmount(basket);
	
	if(donationAmount.available) {
		
		for each(var shippingCost in shippingCosts) {
			
			var baseShipping = shippingCost.baseShipping;
			var baseShippingAdjusted = shippingCost.baseShippingAdjusted;
			var shippingPriceAdjustmentsTotal = shippingCost.shippingPriceAdjustmentsTotal;
			
			if(baseShipping.compareTo(donationAmount) > 0) {
				
				shippingCost.baseShipping = baseShipping.subtract(donationAmount);
			}
			if(baseShippingAdjusted.compareTo(donationAmount) > 0) {
				
				shippingCost.baseShippingAdjusted = baseShippingAdjusted.subtract(donationAmount);
			}
		}
	}
	
	return {
		'ShippingCosts' : shippingCosts
	};
}


/**
 * This function is used to get the pennies template to display on the storefront.
*/
function displayPenniesBanner() {

	var renderingTemplate : String = '';
   var displayInformPanelBanner = request.httpParameterMap.isParameterSubmitted('displayinformbanner') && (request.httpParameterMap.displayinformbanner.value == 'true');
	
	var basket = PenniesUtil.getBasket();
	
	if(basket == null) {
		
		renderingTemplate = 'banners/penniesemptybanner';
		
	} else if(displayInformPanelBanner) {
		
		//Display only the inform panel banner
		if(empty(session.privacy.penniesCharities)){
			
			//Get the charity names
			var apiResult = getCharityDetails();
		}
		
		renderingTemplate = 'banners/penniesinformpanelbanner';
		
	} else if(PenniesUtil.isDonationAddedInBasket()) { 
		
		renderingTemplate = 'banners/penniesdonationaddedbanner';
		
	} else {
		
		var callCalculateAPI = !('penniesBasketTotal' in session.privacy)  || (session.privacy.penniesBasketTotal != basket.getTotalGrossPrice().value);
		
		if(callCalculateAPI){
			//Call the calculate donation API only if
			//   - penniesBasketTotal has not been set in session
			//   - OR basket total changed after the last pennies API call
			var apiResult = calculateDonation();
		}
		
		//Display inform banner if 
		//   - error occurs while calculating donation amount
		//   - calculated donation amount is 0
		if( (!callCalculateAPI || !apiResult.errorOccurred) && session.privacy.penniesDonationAmount > 0) {
			
			renderingTemplate = 'banners/penniesinvitetodonatebanner';
		} else {
			
			renderingTemplate = 'banners/penniesinformpanelbanner';
		}
	}
	return renderingTemplate;

}


/**
 * This function is used to calculate the cart total. We avoid using CartModel.calculate() because we have the monitor basket code within
 * CartModel.calculate(). Please refer to Pennies.addDonation() for more details
 */
function calculateCart(basket) {
	
	dw.system.HookMgr.callHook('dw.order.calculate', 'calculate', basket);
}

/**
 * 
 * This function clears the below pennies related session values. This is normally invoked when 
 *  the donation is removed from the basket or when an order is placed.
 *  
 *   - penniesBasketTotal
 *   - penniesDonationAdded
 *   - penniesDonationAmount
 *   - hashKey
 *   - charities
 * 
 */
function clearSessionValues() {
	
	delete session.privacy.penniesBasketTotal;
    delete session.privacy.penniesDonationAmount;
    delete session.privacy.penniesHashKey;
    delete session.privacy.penniesCharities;
}


module.exports = {
	monitorBasket : monitorBasketChangesForPennies,
	addDonationToBasket : addDonationToBasket,
	removeDonationFromBasket : removeDonationFromBasket,
	calculateDonation : calculateDonation,
	updatePenniesDonationDetailsOnOrder : updatePenniesDonationDetailsOnOrder,
	markDonationReadyForExport : markDonationReadyForExport,
	getCharityDetails : getCharityDetails,
	updateShippingCosts : updateShippingCosts,
	displayPenniesBanner : displayPenniesBanner
};