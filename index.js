'use strict';

var P = require('bluebird');
function stripeProc( apiKey){
    this.stripe = require('stripe')(apiKey);
    
    this.voidTransaction = function(transId){
        var resolver = P.pending();
        this.stripe.refunds.create({charge: transId}, function(err, refund){
            if(err){
                return resolver.reject(err);
            }
            resolver.resolve({responseCode:['1'], transactionStatus:['void'], response: refund});
        });
        return resolver.promise;
    };
    
    this.refundTransaction = function(transId){
        var resolver = P.pending();
        this.stripe.refunds.create({charge: transId}, function(err, refund){
            if(err){
                return resolver.reject({message: err});
            }
            resolver.resolve({responseCode:['1'], transactionStatus:['void'], response: refund});
        });
        return resolver.promise;
    };
    this.captureAuthTransaction = function(transId){
        var resolver = P.pending();
        this.stripe.charges.capture(transId, function(err, charge){
            if(err){
                return resolver.reject({message: err});
            }
            resolver.resolve({responseCode:['1'], transactionStatus:['void'], response: charge});
        });
        return resolver.promise;
    };
};
module.exports = function( apiKey){
    return new stripeProc( apiKey);
};