describe('MC Service: isImage', function() {
    // ref: src/app/global.services/isImage.service.js

    beforeEach(module('materialscommons'));

    var service;

    beforeEach(inject(function($injector){
        service = $injector.get('isImage');
    }));


    it('should exist', function() {
        expect(service).toBeDefined();
    });

    it('should show image mime values as true', function(){
        var imageMimeValues = [
            'image/gif', 'image/jpeg', 'image/png',
            'image/tiff', 'image/x-ms-bmp', 'image/bmp'
        ];
        imageMimeValues.forEach( (mime) => {
            expect(service(mime)).toBe(true);
        });
    });

    it('should show non-image mime values as false', function(){
        var imageMimeValues = [
            'text/plain', 'text/html', 'text/css', 'text/javascript',
            'application/octet-stream', 'application/pkcs12',
            'application/vnd.mspowerpoint', 'application/xhtml+xml',
            'application/xml',  'application/pdf'
        ];
        imageMimeValues.forEach( (mime) => {
            expect(service(mime)).toBe(false);
        });
    });

});

