'use strict';

/**
 * Controller that for pennies API call.
 *
 * @module controllers/PenniesAPI
 */

var LocalServiceRegistry = require( 'dw/svc/LocalServiceRegistry');
var ServiceRegistry = require('dw/svc/ServiceRegistry');
var Site = require( 'dw/system/Site' );
var Logger = require('dw/system/Logger').getLogger('pennies.api');

function getAccountDetails() {
	var accessToken : String = Site.getCurrent().getPreferences().getCustom()["penniesAccessToken"];
	var merchantID : String = Site.getCurrent().getPreferences().getCustom()["penniesMerchantID"];
	var pref : String = Site.getCurrent().getPreferences().getCustom()
	var testAccount = pref["penniesTestAccount"].getValue();

	// Return test account or live details
	if(testAccount) {
		switch (testAccount) {
			case 'TEST1':
				return {
					penniesMerchantID: '999010',
					penniesAccessToken: 'C47t1',
				}
			case 'TEST2':
				return {
					penniesMerchantID: '999020',
					penniesAccessToken: 'C47t2',
				}
			case 'TEST3':
				return {
					penniesMerchantID: '999030',
					penniesAccessToken: 'C47t3',
				}
			case 'TEST4':
				return {
					penniesMerchantID: '999040',
					penniesAccessToken: 'C47t4',
				}
			default:
				return {
					penniesMerchantID: merchantID,
					penniesAccessToken: accessToken,
				}
		}
	} else {

		return {
			penniesMerchantID: merchantID,
			penniesAccessToken: accessToken,
		}
	}

}
/**
 * This function makes the API call to Pennies using the basket total.
 * 
 * The values returned in response are stored in the session
 * 
 */
function calculateDonation(basket) {

	logView();
	var responseObj : JSON ;
	var accountDetails = getAccountDetails();
	var accessToken : String = accountDetails.penniesAccessToken;
	var merchantID : String = accountDetails.penniesMerchantID;

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

function logView() {
	try {
	 var CustomObjectMgr = require('dw/object/CustomObjectMgr');
	 var Transaction = require('dw/system/Transaction');
	 var UUIDUtils = require('dw/util/UUIDUtils');
	 var uniqueID = UUIDUtils.createUUID();

	 Transaction.wrap(function () {
	 	var customObject = CustomObjectMgr.createCustomObject("penniesViews", uniqueID);
	 });
	} catch (error) {
		
	}
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
 * This function sends the report to Pennies Donation API
 */
function postReport(currency,dateTime,payments) {

	var accountDetails = getAccountDetails();
	var accessToken : String = accountDetails.penniesAccessToken;
	var merchantID : String = accountDetails.penniesMerchantID;

	var service  = LocalServiceRegistry.createService("pennies.report.http.service",{
		createRequest: function(svc:HTTPService,body) {
			var url = svc.getURL();

			svc.addHeader('Access-Token', accessToken);
			svc.addHeader('Access-Account', merchantID);
			svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
			svc.setRequestMethod("POST");
			svc.setURL((svc.getURL()) + "/ped");
			return body;
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
			var responseMsg = "Send Pennies Report ::::: Response Code = " + statusCode +
				" :::::  Response Message = " + statusMessage +
				" :::::  Response = " + serviceResponse +
				" ::::: Error Message " + errorMessage;
			return responseMsg;
		}
	});

	// Make the service call here
	var body = "merchant_id=" + merchantID + "&store_id=default&tid=" + currency + "&report_datetime=" + dateTime + '&payments_count=' + payments;
	var result: Result = service.call(body);

	return checkIfAPICallFailed(result, ' Post Report');

}
/*
 * This function sends the donation amount to Pennies Donation API 
 */
function postDonation(order, penniesDonationAmount) {

	var accountDetails = getAccountDetails();
	var accessToken : String = accountDetails.penniesAccessToken;
	var merchantID : String = accountDetails.penniesMerchantID;
	var penniesHashKey = order.custom.penniesHashKey;
	var transactionId = order.orderNo;
	var currencyCode;

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
	switch (order.currencyCode) {
		case 'GBP':
			currencyCode = '826';
			break;
		case 'EUR':
			currencyCode = '978';
			break;
		case 'USD':
			currencyCode = '840';
			break;
	}
	
	// Make the service call here
	var params = 'amount='+penniesDonationAmount+'&hash='+penniesHashKey+'&transaction_id='+transactionId+"&currency="+currencyCode;
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

	var responseObj: JSON;
	var accountDetails = getAccountDetails();
	var accessToken: String = accountDetails.penniesAccessToken;
	var merchantID: String = accountDetails.penniesMerchantID;

	var amount = 10.1;
	//Making the reference to a Pennies certificate imported in Business Manager -Not required in js controllers
	//CertificateRef("penniescertificate");

	var service = LocalServiceRegistry.createService("pennies.calculation.http.service", {
		createRequest: function (svc: HTTPService, params) {
			svc.addHeader('Access-Token', accessToken);
			svc.setRequestMethod("GET");
			svc.setURL((svc.getURL()) + "/calculation/" + merchantID);
			svc.addParam('amount', amount);
			svc.addParam('format', 'json');
		},
		parseResponse: function (svc: HTTPService, output) {
			return output;
		},
		getRequestLogMessage: function (reqObj: Object) {
			return reqObj;
		},
		getResponseLogMessage: function (respObj: Object) {
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

	// Capture start time before making the service call
	var startTime = new Date().getTime();
	var TestDelay = Site.current.getCustomPreferenceValue('penniesCalculationServiceDelay') ? Site.current.getCustomPreferenceValue('penniesCalculationServiceDelay') : 0;
	var result = service.call(params);

	// Capture end time after the service call completes
	var endTime = new Date().getTime();

	// Calculate the duration
	var duration = endTime - startTime;
	if (TestDelay) {
		duration = duration + TestDelay;
	}
	var apiResult = checkIfAPICallFailed(result, 'Retrieve Charity Details');

	if (apiResult.errorOccurred)
		return { 'errorOccurred': true };

	var responseJSONVal = result.object.text;
	var responseObj = JSON.parse(responseJSONVal);
	if (duration) {
		responseObj.charities[0].apiDurationTime = duration;
	}

	//Update charity details
	session.privacy.penniesCharities = JSON.stringify(responseObj.charities);
	var priv = session.privacy.penniesCharities;
	return { 'errorOccurred': false };
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
	postReport : postReport,
	getAccountDetails : getAccountDetails,
	retrievePenniesCharityDetails : retrievePenniesCharityDetails
}
