/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js":
/*!***************************************************************************************************************!*\
  !*** ../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (include) {\n    if (typeof include === 'function') {\n        include();\n    } else if (typeof include === 'object') {\n        Object.keys(include).forEach(function (key) {\n            if (typeof include[key] === 'function') {\n                include[key]();\n            }\n        });\n    }\n};\n\n\n//# sourceURL=webpack:///../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js?");

/***/ }),

/***/ "./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies.js":
/*!****************************************************************************!*\
  !*** ./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* eslint-env jquery */\n\n\nvar processInclude = __webpack_require__(/*! base/util */ \"../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js\");\n\n$(document).ready(function () {\n    processInclude(__webpack_require__(/*! ./pennies/pennies */ \"./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies/pennies.js\"));\n});\n\n\n//# sourceURL=webpack:///./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies.js?");

/***/ }),

/***/ "./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies/pennies.js":
/*!************************************************************************************!*\
  !*** ./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies/pennies.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* eslint-env jquery */\n\n\n/**\n * the function to refresh banner\n */\nfunction refreshBanner() {\n    if ($('#penniesMainContainer').length > 0) {\n        var refreshPenniesBannerUrl = $('#displaypennies').data('penniesurl');\n        $.ajax({\n            dataType: 'html',\n            url: refreshPenniesBannerUrl\n        })\n        .done(function (response) {\n            $('#penniesMainContainer').html($(response));\n        });\n    }\n}\n\n/**\n * updates the totals\n * @param {Object} penniesDonation donation info\n */\nfunction updateTotals(penniesDonation) {\n    if (penniesDonation) {\n        if (penniesDonation.donationAmount !== 0) {\n            $('.donation-item').show();\n            $('.donation-total').text(penniesDonation.donationDisplayAmount);\n        } else {\n            $('.donation-item').hide();\n        }\n        if (penniesDonation.shippingPriceExclDonationAmount !== 0) {\n            $('.shipping-total-cost').text(penniesDonation.shippingPriceExclDonationAmount);\n        }\n        $('.grand-total-sum').text(penniesDonation.grandTotal);\n    } else {\n        $('.donation-item').hide();\n    }\n    refreshBanner();\n}\n\n/**\n * the function to donate pennies\n * donate button\n */\nfunction donateToPennies() {\n    if ($('span#penniesInviteBtn').length > 0) {\n        var donateToPenniesUrl = $('span#penniesInviteBtn').data('inviteurl');\n        $.spinner().start();\n        $.ajax({\n            dataType: 'json',\n            url: donateToPenniesUrl\n        })\n            .done(function (data) {\n                updateTotals(data.penniesDonation);\n                $.spinner().stop();\n            })\n                .fail(function () {\n                    $.spinner().stop();\n                });\n    }\n}\n\n/**\n * the function to remove donation pennies\n * remove button\n */\nfunction removeDonation() {\n    if ($('span#penniesRemoveBtn').length > 0) {\n        var removePenniesDonationUrl = $('span#penniesRemoveBtn').data('removeurl');\n        $.spinner().start();\n        $.ajax({\n            dataType: 'json',\n            url: removePenniesDonationUrl\n        })\n            .done(function (data) {\n                if (data.status === 1) {\n                    updateTotals(data.penniesDonation);\n                }\n                $.spinner().stop();\n            })\n            .fail(function () {\n                $.spinner().stop();\n            });\n    }\n}\n\n/**\n * re-renders the order totals and the number of items in the cart\n * @param {Object} data - AJAX response from the server\n */\nfunction updateCartTotal() {\n    var url = $('#displaypennies').attr('data-summaryurl');\n    if ($('#displaypennies').length > 0) {\n        $.ajax({\n            url: url,\n            method: 'GET',\n            success: function (response) {\n                if (!response.error) {\n                    var penniesDonation = response.penniesDonation;\n                    if (penniesDonation.donationAmount !== 0) {\n                        $('.donation-item').show();\n                        $('.donation-total').text(penniesDonation.donationDisplayAmount);\n                    } else {\n                        $('.donation-item').hide();\n                    }\n                    if (penniesDonation.shippingPriceExclDonationAmount !== 0) {\n                        $('.shipping-cost').text(penniesDonation.shippingPriceExclDonationAmount);\n                    }\n                } else {\n                    $('.donation-item').hide();\n                }\n            }\n        });\n    }\n}\n/**\n * re-renders the order totals and the number of items in the cart after cart update actions\n */\nfunction checkCartUpdates() {\n    var exitCount = 0;\n    var checkCartUpdate = setInterval(function next() {\n        exitCount++;\n        if (!$('.totals').find('div').hasClass('veil')) {\n            clearInterval(checkCartUpdate);\n            updateCartTotal();\n        }\n        if (exitCount === 3) {\n            clearInterval(checkCartUpdate);\n            exitCount = 0;\n        }\n    }, 500);\n}\n/**\n * re-renders the order totals and the number of items in the cart after cart update actions\n */\nfunction checkCartActionUpdates() {\n    var exitCount = 0;\n    var checkCartUpdate = setInterval(function next() {\n        exitCount++;\n        if (!$('body').find('div').hasClass('veil')) {\n            clearInterval(checkCartUpdate);\n            updateCartTotal();\n        }\n        if (exitCount === 3) {\n            clearInterval(checkCartUpdate);\n            exitCount = 0;\n        }\n    }, 500);\n}\nmodule.exports = {\n    init: function () {\n        $('body').on('click', 'span#penniesRemoveBtn', removeDonation);\n        $('body').on('click', 'span#penniesInviteBtn', donateToPennies);\n    },\n    refreshBannerInfo: function () {\n        refreshBanner();\n    },\n    updateCheckoutView: function () {\n        $('body').bind('checkout:updateCheckoutView', function (e, data) {\n            updateTotals(data.order.penniesDonation);\n        });\n    },\n    update: function () {\n        $('body').bind('cart:update', function () {\n            updateCartTotal();\n        });\n        $('.shippingMethods').bind('change', function () {\n            checkCartUpdates();\n        });\n        $('.promo-code-form').bind('submit', function () {\n            checkCartActionUpdates();\n        });\n        $('.delete-coupon-confirmation-btn').bind('click', function () {\n            checkCartActionUpdates();\n        });\n    }\n};\n\n\n//# sourceURL=webpack:///./cartridges/int_pennies_SFRA/cartridge/client/default/js/pennies/pennies.js?");

/***/ })

/******/ });