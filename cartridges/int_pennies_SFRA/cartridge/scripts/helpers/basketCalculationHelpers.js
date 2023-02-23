'use strict';

var base = module.superModule;
var HookMgr = require('dw/system/HookMgr');

/**
 * Calculate all totals as well as shipping and taxes
 * @param {dw.order.Basket} basket - current basket
 */
base.calculateTotals = function (basket) {
    HookMgr.callHook('dw.order.calculate', 'calculate', basket);
    // Pennies Changes : START - Check if basket total has changed since last donation
    var libPennies = require('*/cartridge/scripts/common/libPennies');
    libPennies.monitorBasket(basket);
    // Pennies Changes : END - Check if basket total has changed since last donation
};

module.exports = base;
