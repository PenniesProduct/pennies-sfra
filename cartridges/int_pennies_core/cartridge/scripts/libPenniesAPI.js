'use strict';

/**
 * Controller that for pennies API call.
 *
 * @module controllers/PenniesAPI
 */

var LocalServiceRegistry = require( 'dw/svc/LocalServiceRegistry');
var Site = require( 'dw/system/Site' );
var Logger = require('dw/system/Logger').getLogger('pennies.api');

/**
 * This function makes the API call to Pennies using the basket total.
 * 
 * The values returned in response are stored in the session
 * 
 */
function calculateDonation(basket) {
	
	var responseObj : JSON ;
	var accessToken : String = Site.getCurrent().getPreferences().getCustom()["penniesAccessToken"];
	var merchantID : String = Site.getCurrent().getPreferences().getCustom()["penniesMerchantID"];

	var basketTotal = basket.getTotalGrossPrice().value
	
	var service  = LocalServiceRegistry.createService("pennies.calculation.http.service",{
		createRequest: function(svc:HTTPService, params) {
	         svc.addHeader('Access-Token', accessToken);
	         svc.setRequestMethod("GET");
	         svc.setURL((svc.getURL()) + "/calculation/" + merchantID);
	         svc.addParam('amount', basketTotal);
	         svc.addParam('format','json');
	    },
	    parseResponse: function(svc:HTTPService, output) {
			return output;
		},
		getRequestLogMessage: function(reqObj:Object) {	
			return reqObj;
		},
		getResponseLogMessage: function(respObj : Object) {				
			var statusCode = respObj.statusCode;
			var statusMessage = respObj.statusMessage;
			var serviceResponse = respObj.text;
			var errorMessage = respObj.errorText;	
			var responseMsg = "Pennies Calculation ::::: Response Code = " + statusCode + 
							" :::::  Response Message = " + statusMessage + 
							" :::::  Response = " + serviceResponse + 
							" ::::: Error Message " + errorMessage;
			return responseMsg;	
		} 
	});
	
	var params = {};
	
	var result: Result = service.call();
	
	var apiResult = checkIfAPICallFailed(result, 'Calculate Donation');
	
	// Retry once in case of error while calculating donation amount
	if(apiResult.errorOccurred){
		result = getService(accessToken,merchantID,basketTotal).call();
		apiResult = checkIfAPICallFailed(result, 'Calculate Donation');
	}
	
	if(apiResult.errorOccurred) return {'errorOccurred' : true};
		
	var responseJSONVal = result.object.text;  
	var responseObj = JSON.parse(responseJSONVal);
	
	updateSessionValues(responseObj);
	
	session.privacy.penniesBasketTotal = basketTotal;
		
	return {'errorOccurred' : false};
}

/*
 * This function will return service object to make calculate donation call
 */
function getService(accessToken,merchantID,basketTotal){
	
	var service  = LocalServiceRegistry.createService("pennies.calculation.http.service",{
		createRequest: function(svc:HTTPService, params) {
	         svc.addHeader('Access-Token', accessToken);
	         svc.setRequestMethod("GET");
	         svc.setURL((svc.getURL()) + "/calculation/" + merchantID);
	         svc.addParam('amount', basketTotal);
	         svc.addParam('format','json');
	    },
	    parseResponse: function(svc:HTTPService, output) {
			return output;
		},
		getRequestLogMessage: function(reqObj:Object) {	
			return reqObj;
		},
		getResponseLogMessage: function(respObj : Object) {				
			var statusCode = respObj.statusCode;
			var statusMessage = respObj.statusMessage;
			var serviceResponse = respObj.text;
			var errorMessage = respObj.errorText;	
			var responseMsg = "Pennies Calculation ::::: Response Code = " + statusCode + 
							" :::::  Response Message = " + statusMessage + 
							" :::::  Response = " + serviceResponse + 
							" ::::: Error Message " + errorMessage;
			return responseMsg;	
		} 
	});
	return service;
	
}
/*
 * This function sends the donation amount to Pennies Donation API 
 */
function postDonation(order, penniesDonationAmount) {
	
	var responseObj : JSON ;
	
	var accessToken : String = Site.getCurrent().getPreferences().getCustom()["penniesAccessToken"];
	var merchantID : String = Site.getCurrent().getPreferences().getCustom()["penniesMerchantID"]; 
	var penniesHashKey = order.custom.penniesHashKey;

	var service  = LocalServiceRegistry.createService("pennies.donation.http.service",{
		createRequest: function(svc:HTTPService,params) {
	         svc.addHeader('Access-Token', accessToken);
	         svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
	         svc.setRequestMethod("POST");
	         svc.setURL((svc.getURL()) + "/" + merchantID);
	         return params;
	    },
	    parseResponse: function(svc:HTTPService, output) {
			return output;
		},
		getRequestLogMessage: function(reqObj:Object) {	
			return reqObj;
		},
		getResponseLogMessage: function(respObj : Object) {				
			var statusCode = respObj.statusCode;
			var statusMessage = respObj.statusMessage;
			var serviceResponse = respObj.text;
			var errorMessage = respObj.errorText;	
			var responseMsg = "Send Pennies Donation ::::: Response Code = " + statusCode + 
								" :::::  Response Message = " + statusMessage + 
								" :::::  Response = " + serviceResponse + 
								" ::::: Error Message " + errorMessage;
			return responseMsg;	
		} 
	});	
	
	// Make the service call here
	var params = 'amount='+penniesDonationAmount+'&hash='+penniesHashKey;
	var result: Result = service.call(params);
	
	return checkIfAPICallFailed(result, ' Post Donation');
		
}

/**
 * This function makes the API call to Pennies using the basket total.
 * 
 * The values returned in response are stored in the session
 * 
 */
function retrievePenniesCharityDetails() {
	
	var responseObj : JSON ;
	var accessToken : String = Site.getCurrent().getPreferences().getCustom()["penniesAccessToken"];
	var merchantID : String = Site.getCurrent().getPreferences().getCustom()["penniesMerchantID"];

	var amount = 10.1;
	//Making the reference to a Pennies certificate imported in Business Manager -Not required in js controllers
	//CertificateRef("penniescertificate");

	var service  = LocalServiceRegistry.createService("pennies.calculation.http.service",{
		createRequest: function(svc:HTTPService, params) {
	         svc.addHeader('Access-Token', accessToken);
	         svc.setRequestMethod("GET");
	         svc.setURL((svc.getURL()) + "/calculation/" + merchantID);
	         svc.addParam('amount', amount);
	         svc.addParam('format','json');
	    },
	    parseResponse: function(svc:HTTPService, output) {
			return output;
		},
		getRequestLogMessage: function(reqObj:Object) {	
			return reqObj;
		},
		getResponseLogMessage: function(respObj : Object) {				
			var statusCode = respObj.statusCode;
			var statusMessage = respObj.statusMessage;
			var serviceResponse = respObj.text;
			var errorMessage = respObj.errorText;	
			var responseMsg = "Retrieved Pennies Charity details ::::: Response Code = " + statusCode + 
								" :::::  Response Message = " + statusMessage + 
								" :::::  Response = " + serviceResponse + 
								" ::::: Error Message " + errorMessage;
			return responseMsg;	
		} 
	});
		
	var params = {};
	
	var result = service.call(params);
	
	var apiResult = checkIfAPICallFailed(result, 'Retrieve Charity Details');
	
	if(apiResult.errorOccurred) 
		return {'errorOccurred' : true};
		
	var responseJSONVal = result.object.text;  
	var responseObj = JSON.parse(responseJSONVal);
		
	//Update charity details
	session.privacy.penniesCharities = JSON.stringify(responseObj.charities);    	 	
	return {'errorOccurred' : false};
}


/**
 * This function checks if the result of the API call was an error and logs the appropriate error
 * Returns an object with the result details
 * 
 * @param result
 * @returns object
 */
function checkIfAPICallFailed(result, action) {
	
	if(result == null || !result.ok || result.object == null) {
		
		var errorDetails = (result != null && result.object != null) ? result.object : '';
		
		Logger.error('An error occurred during ' + action + ' API call. Error details : '+ errorDetails + ' . Error Message : ' + result.errorMessage);
		
		return {
			errorOccurred : true,
			errorMessage : result.errorMessage
		};
	}
	
	return {
		errorOccurred : false
	};
}

/**
 * This function updates the pennies related session attributes.
 * 
 * @param responseObj - The response from Pennies API
 * @returns
 */
function updateSessionValues(responseObj) {	
	session.privacy.penniesHashKey = responseObj.hash;
    session.privacy.penniesDonationAmount = responseObj.donation_amount;
    session.privacy.penniesCharities = JSON.stringify(responseObj.charities);        
}

module.exports = {
	calculateDonation : calculateDonation,
	postDonation : postDonation,
	retrievePenniesCharityDetails : retrievePenniesCharityDetails
}
