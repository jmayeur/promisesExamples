(function(){
    'use strict';

    var simplePromisesInstance, _$q, _$rootScope, promiseHelpers;



    beforeEach(
        function(){
            module('promises');
            inject(function($q, $rootScope, SimplePromises){

                simplePromisesInstance = SimplePromises;
                _$q = $q;
                _$rootScope = $rootScope;
            });

            promiseHelpers = {
                resolvedCalledCount: 0,
                rejectedCalledCount: 0,
                notifyCalledCount: 0,

                resolvedValue: null,
                rejectedError: null,
                notifyValues: [],

                resolvedHandler: function(result){
                    promiseHelpers.resolvedValue = result;
                    promiseHelpers.resolvedCalledCount++;
                },

                rejectedHandler: function(error){
                    promiseHelpers.rejectedError = error;
                    promiseHelpers.rejectedCalledCount++;
                },

                notifyHandler: function(notification){
                    promiseHelpers.notifyValues.push(notification);
                    promiseHelpers.notifyCalledCount++;
            }
            }
        });

    describe('Promises Demo: SimplePromises', function () {


        it('Should return a promise when SimplePromises.GetAPromise is called', function(){
            var promise =  simplePromisesInstance.getAPromise();
            expect(is$qPromise(promise)).toBeTruthy();

            simplePromisesInstance.deleteAPromise(promise);
        });

        it('Should call then.success when a promise is resolved', function(){

            var promise = simplePromisesInstance.getAPromise();
            promise.then(promiseHelpers.resolvedHandler, promiseHelpers.rejectedHandler, promiseHelpers.notifyHandler);

            simplePromisesInstance.resolveAPromise(promise, null);

            //force the promise resolution
            _$rootScope.$apply();

            expect(promiseHelpers.resolvedCalledCount).toEqual(1);

            simplePromisesInstance.deleteAPromise(promise);
        });

        it('Should call then.rejected when a promise is rejected', function(){

            var promise = simplePromisesInstance.getAPromise();
            promise.then(promiseHelpers.resolvedHandler, promiseHelpers.rejectedHandler, promiseHelpers.notifyHandler);

            //simplePromisesInstance.ResolveAPromise(promise, null);
            simplePromisesInstance.rejectAPromise(promise, null);


            //force the promise resolution
            _$rootScope.$apply();

            expect(promiseHelpers.rejectedCalledCount).toEqual(1);

            simplePromisesInstance.deleteAPromise(promise);
        });

        it('Should call then.rejected on the fallback when a promise is rejected', function(){

            var promise = simplePromisesInstance.getAPromise();
            promise.then(promiseHelpers.resolvedHandler)
                .then(null, promiseHelpers.rejectedHandler /* catch all for errors - */);

            //simplePromisesInstance.ResolveAPromise(promise, null);
            simplePromisesInstance.rejectAPromise(promise, null);


            //force the promise resolution
            _$rootScope.$apply();

            expect(promiseHelpers.rejectedCalledCount).toEqual(1);

            simplePromisesInstance.deleteAPromise(promise);
        });


        it('Should call then.rejected on the first reject handler in a promise chain', function(){

            var localRejectHandlerCalledCount, localRejectHandler, promise;

            promise = simplePromisesInstance.getAPromise();
            localRejectHandlerCalledCount = 0;
            localRejectHandler = function(e){
                localRejectHandlerCalledCount++;
            };

            promise.then(promiseHelpers.resolvedHandler)
                .then(promiseHelpers.resolvedHandler)
                .then(promiseHelpers.resolvedHandler)
                .then(promiseHelpers.resolvedHandler)
                .then(promiseHelpers.resolvedHandler)
                .then(null, localRejectHandler)
                .then(promiseHelpers.resolvedHandler)
                .then(promiseHelpers.resolvedHandler)
                .then(promiseHelpers.resolvedHandler)
                .then(null, promiseHelpers.rejectedHandler /* catch all for errors - */)
                .then(promiseHelpers.resolvedHandler)
                .then(null, localRejectHandler);

            simplePromisesInstance.rejectAPromise(promise, null);
            simplePromisesInstance.rejectAPromise(promise, null);
            simplePromisesInstance.rejectAPromise(promise, null);

            //force the promise resolution
            _$rootScope.$apply();

            expect(promiseHelpers.rejectedCalledCount).toEqual(0);
            expect(localRejectHandlerCalledCount).toEqual(1);

            simplePromisesInstance.deleteAPromise(promise);
        });


        it('Should call then.notify on the fallback when a promise is notified', function(){

            var one, two, three, expectedNofitifcations;
            one = { id: 'one' };
            two = { id: 'two' };
            three = { id: 'three' };

            expectedNofitifcations = [one, two, three];

            var promise = simplePromisesInstance.getAPromise();
            promise.then(promiseHelpers.resolvedHandler, null, promiseHelpers.notifyHandler)
                .then(null, promiseHelpers.rejectedHandler /* catch all for errors - */);

            simplePromisesInstance.notifyAPromise(promise, one);
            simplePromisesInstance.notifyAPromise(promise, two);
            simplePromisesInstance.notifyAPromise(promise, three);

            simplePromisesInstance.rejectAPromise(promise, null);


            //force the promise resolution
            _$rootScope.$apply();

            expect(promiseHelpers.notifyCalledCount).toEqual(3);
            expect(promiseHelpers.notifyValues).toEqual(expectedNofitifcations);

            simplePromisesInstance.deleteAPromise(promise);
        });


        it('Should not call the notify or resolved handlers, after a promise has been rejected', function(){

            var promise = simplePromisesInstance.getAPromise();
            promise.then(promiseHelpers.resolvedHandler, null, promiseHelpers.notifyHandler)
                .then(null, promiseHelpers.rejectedHandler /* catch all for errors - */);

            simplePromisesInstance.rejectAPromise(promise, null);
            simplePromisesInstance.resolveAPromise(promise, null);
            simplePromisesInstance.notifyAPromise(promise, null);

            //force the promise resolution
            _$rootScope.$apply();

            expect(promiseHelpers.rejectedCalledCount).toEqual(1);
            expect(promiseHelpers.resolvedCalledCount).toEqual(0);
            expect(promiseHelpers.notifyCalledCount).toEqual(0);
            expect(promiseHelpers.notifyValues.length).toEqual(0);



            simplePromisesInstance.deleteAPromise(promise);
        });


    });




    //via http://stackoverflow.com/questions/13075592/how-can-i-tell-if-an-object-is-a-jquery-promise-deferred
    var is$qPromise = function(value) {

        if (typeof value.then !== "function") {
            return false;
        }

        var promiseThenSrc = String(_$q.defer().promise.then);
        var valueThenSrc = String(value.then);

        return promiseThenSrc === valueThenSrc;
    }
}());