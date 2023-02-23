'use strict';

var dwsystem = require('dw/system');
var asList = require('dw/util/List');
var SeekableIterator = require('dw/util/SeekableIterator');
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');	
var ArrayList = require('dw/util/ArrayList');
var libPenniesAPI = require('*/cartridge/scripts/libPenniesAPI');
var PenniesUtil = require('*/cartridge/scripts/util/PenniesUtil');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger').getLogger('pennies.api');
var File = require('dw/io/File');
var Calendar = require('dw/util/Calendar');
var FileWriter = require('dw/io/FileWriter');
var CSVStreamWriter = require('dw/io/CSVStreamWriter');

/**
 * This function for post donation transaction
 */  	
function postPenniesDonation(parameters, stepExecution) {
 	var errorDetail =''; 	
	var failedOrderDetails = new ArrayList();
	
	// select all success order with pennies donation status readytoexport
 	var PenniesOrders : SeekableIterator = OrderMgr.searchOrders(' custom.penniesDonationStatus = {0} AND ( status != {1} OR status != {2} )','orderNo desc','readytoexport',Order.ORDER_STATUS_CREATED,Order.ORDER_STATUS_FAILED);
 	var PenniesOrdersCount : Number = PenniesOrders.count;
	
	if(PenniesOrdersCount<=0)		
		return new dwsystem.Status(dwsystem.Status.OK, "NO_ORDERS_FOUND", "Job completed successfully. No orders were found");
						
		while (PenniesOrders.hasNext()) {	
				var order = PenniesOrders.next();
				var donationAmount = PenniesUtil.getPenniesDonationAmount(order);
			   
			   	if(donationAmount.available && donationAmount.value > 0) {
			   	
					var apiResult = libPenniesAPI.postDonation(order, donationAmount.value);
					
					//update order with pennies donation status as exported and pennies post date
					if(!apiResult.errorOccurred) {
                        Transaction.wrap(function () {
                            order.custom.penniesDonationStatus = 'exported';
		   					order.custom.penniesPostDate = new Date();
                        });	
			   			
			   		} else {
			   			errorDetail = ['Order : ' + order.orderNo, apiResult.errorMessage].join('  -   ');
			   			failedOrderDetails.add(errorDetail);
					}
			   		
				}
		}		
 		PenniesOrders.close();
 		
		if(failedOrderDetails.empty){		
			return new dwsystem.Status(dwsystem.Status.OK, "JOB_SUCCESS", "Job completed successfully.");
		}else{
			var errorDetails : List = failedOrderDetails;
			var logMessage = errorDetails.join('\n');
			Logger.error("Job finished with errors. {0}",logMessage);
		}
	
		return new dwsystem.Status(dwsystem.Status.ERROR, "JOB_ERROR", "Job finished with errors." );
}


/**
 * This function for generate Pennies Donation Report
 */
function generatePenniesDonationReport( parameters, stepExecution) {

	var fileNamePrefix = 'FileNamePrefix' in parameters ? parameters.FileNamePrefix : null;
	var impexFolderPath = 'IMPEXFolderPath' in parameters ? parameters.IMPEXFolderPath : null;
	
	if('ReportStartDate' in parameters) {
		var reportStartDate = parameters.ReportStartDate;
	}
	if('ReportEndDate' in parameters) {
		var reportEndDate  = parameters.ReportEndDate;
	}
	
	if(!empty(impexFolderPath) && !empty(fileNamePrefix)){
			var startDate = reportStartDate != null ? new dw.util.Calendar(reportStartDate) : null;
			var endDate = reportEndDate != null ? new dw.util.Calendar(reportEndDate) : null;
			
			var queryStartDate = '';
			var queryEndDate = '';
	
			if(startDate != null){
		  		queryStartDate = new Date(startDate.getTime().toDateString());		  		
			}
			if(endDate != null){
				endDate.add(Calendar.DAY_OF_MONTH, 1);
				queryEndDate = new Date(endDate.getTime().toDateString());
		  	}
		  	
		  	var queryString : String = ''; 	
		 	queryString += ' custom.penniesDonationStatus = {0} ';	
		 	
		 	if(!empty(queryStartDate)) {		 		
		 		queryString += 	' AND custom.penniesPostDate > {1} ';
		 	}	
		 	
		 	if(!empty(queryEndDate)) {		 	
		 		queryString += 	' AND custom.penniesPostDate < {2} ';
		 	}
		 	
		 	// select all order with pennies status as exported within the given periods
		 	var PenniesOrders : SeekableIterator = OrderMgr.searchOrders(queryString,'orderNo desc','exported',queryStartDate,queryEndDate);
		 	
		 	//Restricting the limit to 15000 to avoid quota violations
			var PenniesOrdersToExport = PenniesOrders.asList(0, 15000);
			var PenniesOrdersCount = PenniesOrders.count;			
			
			if(PenniesOrdersCount<=0)
				return new dwsystem.Status(dwsystem.Status.OK, "NO_ORDERS_FOUND", "Job completed successfully. No orders were found");			
				
			var penniesDirectoryPath = 'IMPEX/' + impexFolderPath;
			var penniesDirectory = new File(penniesDirectoryPath);
			if(!penniesDirectory.exists()) {					
				penniesDirectory.mkdirs();
			}
			
			var timeStamp = dw.util.StringUtils.formatCalendar(new Calendar(), 'dd-MM-yyyy_HHmmss');
			var reportFileName = fileNamePrefix + "_" + timeStamp + '.csv';
			var reportFile = new File(penniesDirectoryPath + '/' + reportFileName);				
			var reportFW = new FileWriter(reportFile, true);
			var reportCSVW = new CSVStreamWriter (reportFW);
			
			// write report header columns
			var header = ['Order Id', 'Transaction Post Date', 'Transaction Post Time', 'Donation Amount (in pennies)'];
			reportCSVW.writeNext(header);
			
			var transactionDetails = [];				
			for each(var order : Order in PenniesOrdersToExport) {					
				var penniesTransactionPostDateVal = '';
				var penniesTransactionPostTimeVal = '';
				
				if(!empty(order.custom.penniesPostDate)) {						
					var penniesPostCalendarObj 		= new Calendar(order.custom.penniesPostDate);						
					penniesTransactionPostDateVal	= dw.util.StringUtils.formatCalendar(penniesPostCalendarObj, 'dd/MM/yyyy');
					penniesTransactionPostTimeVal 	= dw.util.StringUtils.formatCalendar(penniesPostCalendarObj, 'HH:mm:ss');
				}					
				var penniesDonationAmount = PenniesUtil.getPenniesDonationAmount(order);
				
				// write pennies order donation transaction details to csv
				transactionDetails.push(order.orderNo);
				transactionDetails.push(penniesTransactionPostDateVal);
				transactionDetails.push(penniesTransactionPostTimeVal);
				transactionDetails.push((new Number(penniesDonationAmount) * 100).toFixed(0));
				
				reportCSVW.writeNext(transactionDetails);
				transactionDetails.length = 0;
				transactionDetails = [];
			}
			
			reportCSVW.close();
			reportFW.close();
			PenniesOrders.close();			
			
			var reportFileName = reportFile.fullPath;				
			return new dwsystem.Status(dwsystem.Status.OK, "JOB_SUCCESS", "Job completed successfully. Generated report file can be viewed at " + reportFileName);		
	
	}else{
		return new dwsystem.Status(dwsystem.Status.ERROR, "MISSING_MANDATORY_PARAMETERS", "Mandatory job parameters have not been configured.");
	}
	
	return new dwsystem.Status(dwsystem.Status.ERROR, "JOB_ERROR", "Job finished with errors." );
}


exports.generatePenniesDonationReport = generatePenniesDonationReport;
exports.postPenniesDonation = postPenniesDonation;