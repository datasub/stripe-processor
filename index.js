'use strict';

var P = require('bluebird');
function stripeProc( apiKey){
    this.stripe = require('stripe')(apiKey);
    var self = this;
    
    this.voidTransaction = function(transId, strTransferId, callback){

        var resolver = P.pending();
        
        self.stripe.refunds.create({charge: transId}, function(err, refund){
            if(err){
                return callback? callback(err, refund) :  resolver.reject(err);
            }
            if(strTransferId){
                self.stripe.transfers.createReversal(strTransferId,{refund_application_fee: true}, function (err, revers){
                    if(err){
                        return callback? callback(err, null) :  resolver.reject(err, revers);
                    }
                    callback? callback(err, refund) :  resolver.resolve({responseCode:['1'], transactionStatus:['void'], response: refund});
                });
            }else{
                callback? callback(err, refund) :  resolver.resolve({responseCode:['1'], transactionStatus:['void'], response: refund});
            }
        });
        
        return resolver.promise;
    };
    
    this.refundTransaction = function(transId, strTransferId, callback){

        var resolver = P.pending();
        
        self.stripe.refunds.create({charge: transId}, function(err, refund){
            if(err){
                return callback? callback(err, refund) :  resolver.reject(err, refund);
            }
            if(strTransferId){
                self.stripe.transfers.createReversal(strTransferId,{refund_application_fee: true}, function (err, revers){
                    if(err){
                        return callback? callback(err, null) :  resolver.reject(err, revers);
                    }
                    callback? callback(err, refund) :  resolver.resolve({responseCode:['1'], transactionStatus:['refund'], response: refund});
                });
            }else{
                callback? callback(err, refund) :  resolver.resolve({responseCode:['1'], transactionStatus:['refund'], response: refund});
            }
        });
        return resolver.promise;
    };
    this.captureAuthTransaction = function(transId, callback){
        if(callback){
            return self.stripe.capture.create({charge: transId},callback);
        }
        var resolver = P.pending();
        self.stripe.charges.capture(transId, function(err, charge){
            if(err){
                return resolver.reject({message: err});
            }
            resolver.resolve({responseCode:['1'], transactionStatus:['capture'], response: charge});
        });
        return resolver.promise;
    };
};
module.exports = function( apiKey){
    return new stripeProc( apiKey);
};