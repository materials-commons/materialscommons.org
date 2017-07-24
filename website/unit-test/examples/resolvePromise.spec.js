// source: https://docs.angularjs.org/api/ng/service/$q#testing

//NOTE: promise resolved by $digest (called by the $apply fn of $roosScope - or any ChildScope)

// tests

describe('reolving a promise', function() {
    it('should simulate promise', inject(function($q, $rootScope) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        var resolvedValue;

        promise.then(function(value) { resolvedValue = value; });
        expect(resolvedValue).toBeUndefined();

        // Simulate resolving of promise
        deferred.resolve(123);
        // Note that the 'then' function does not get called synchronously.
        // This is because we want the promise API to always be async, whether or not
        // it got called synchronously or asynchronously.
        expect(resolvedValue).toBeUndefined();

        // Propagate promise resolution to 'then' functions using $apply().
        $rootScope.$apply();
        expect(resolvedValue).toEqual(123);
    }));
});