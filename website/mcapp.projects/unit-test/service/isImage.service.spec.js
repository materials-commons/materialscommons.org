describe('MC Show Process Component Controller', function() {
    // ref: src/app/global.services/isImage.service.js

    beforeEach(module('angular.filter'));
    beforeEach(module('materialscommons'));

    var service;

    beforeEach(inject(function($injector){
        service = $injector.get('isImage');
    }));


    it('should exist', function() {
        expect(service).toBeDefined();
    });

});

