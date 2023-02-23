var $loader;

/** namespace */
var libPennies = (function (libPennies, $) {
	
	function donateToPennies(updateSummarySection) {
		
		var donateToPenniesUrl = PenniesUrls.addPenniesDonation;
		
		 $.ajax({
		        dataType: 'html',
		        url: donateToPenniesUrl
		    })
		    .done(function (response) {
		        
		        $('#penniesMainContainer').find('#penniesInvitePanelWrap').html($(response).filter('#penniesMainContainer').find('#penniesInvitePanelWrap').html());
		    	
		        updateSummary();
		    });
		
	}
		
	function removeDonation(updateSummarySection) {
		
		var removePenniesDonationUrl = PenniesUrls.removePenniesDonation;
		
		$.ajax({
		        dataType: 'html',
		        url: removePenniesDonationUrl
		    })
		    .done(function (response) {
		        
		        $('#penniesMainContainer').find('#penniesInvitePanelWrap').html($(response).filter('#penniesMainContainer').find('#penniesInvitePanelWrap').html());
		 
		        updateSummary();
		    });
	
	}
	
	function updateSummary() {
		
		var $summary = $('#secondary.summary');
	    // indicate progress
	    showProgress($summary);

	    // load the updated summary area
	    $summary.load(Urls.summaryRefreshURL, function () {
	        // hide edit shipping method link
	        $summary.fadeIn('fast');
	        $summary.find('.checkout-mini-cart .minishipment .header a').hide();
	        $summary.find('.order-totals-table .order-shipping .label a').hide();
	    });
	    
	    hideProgress();
	}
	
	function showProgress(container) {
		
		var target = (!container || $(container).length === 0) ? $('body') : $(container);
	    $loader = $loader || $('.loader');

	    if ($loader.length === 0) {
	        $loader = $('<div/>').addClass('loader')
	            .append($('<div/>').addClass('loader-indicator'), $('<div/>').addClass('loader-bg'));
	    }
	    return $loader.appendTo(target).show();
	}
	
	function hideProgress() {
		
		if ($loader) {
	        $loader.hide();
	    }
	}
	
	function refreshBanner() {
		
		var refreshPenniesBannerUrl = PenniesUrls.refreshPenniesBanner;
		
		$.ajax({
	        dataType: 'html',
	        url: refreshPenniesBannerUrl
	    })
	    .done(function (response) {
	    	$('#penniesMainContainer').html($(response));
	    });
		
	}
	
	function initialiseEvents() {
		
		$("body").on("click", "span#penniesRemoveBtn", removeDonation);
		$("body").on("click","span#penniesInviteBtn", donateToPennies);
	}
	
	
	var _libPennies = {
		
		init : function() {
			
			initialiseEvents();
		},
		refreshPenniesBanner : refreshBanner
	};
	return $.extend(libPennies, _libPennies);
	
}(window.libPennies = window.libPennies || {}, jQuery));



$(document).ready(function () {

	libPennies.init();
	
}); 

