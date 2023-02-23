/**
 * Pennies Resource Helper
 */
// importPackage( dw.system );

var Site = require('dw/system/Site');

function PenniesResourceHelper() {}

PenniesResourceHelper.getUrls = function(){
	
	var URLUtils = require('dw/web/URLUtils');
    
    var urls = {
    	
    	addPenniesDonation : URLUtils.url('Pennies-AddDonation').toString(),
    	removePenniesDonation : URLUtils.url('Pennies-RemoveDonation').toString(),
    	refreshPenniesBanner : URLUtils.url('Pennies-DisplayBanner').toString()	
    };
    
    return urls;
}

PenniesResourceHelper.getPreferences = function(){
	
	var preferences = {
    	
    	PENNIES_INTEGRATION_ENABLED : dw.system.Site.current.preferences.custom.penniesDonationIntegrationEnabled
    };
    
    return preferences;
}