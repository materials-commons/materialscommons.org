'use strict';

describe('HelpController', function(){
    it('should create list with 3 names', inject(function($controller){
        var scope = {},
            ctrl = $controller('HelpController', {$scope: scope});
        expect(scope.list.length).toBe(3);
    }));
});



