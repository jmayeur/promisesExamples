 (function(){
    'use strict';


    angular.module('promises').factory('SimplePromises', ['$q', function($q){

        var simplePromisesInstance, promiseCache = {};

        simplePromisesInstance= {

            getAPromise: function(){
                var defer = $q.defer();
                promiseCache[defer.promise] = defer;
                return defer.promise;
            },

            resolveAPromise: function(promise, result){
                var promise = promiseCache[promise];
                promise.resolve(result);
                //delete promiseCache[promise];
                return promise;
            },

            rejectAPromise: function(promise, error){
                var promise = promiseCache[promise];
                promise.reject(error);
                //delete promiseCache[promise];
                return promise;
            },

            notifyAPromise: function(promise, message){
                promiseCache[promise].notify(message);
            },

            deleteAPromise: function(promise){
                var promise = promiseCache[promise];
                delete promiseCache[promise];
            }
        };

        return simplePromisesInstance;

    }]);
}());