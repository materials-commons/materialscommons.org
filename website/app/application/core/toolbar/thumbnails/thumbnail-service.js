Application.Provenance.Services.factory('Thumbnails', [function () {
    var service = {
        model: {
            datadir: '',
            datadirs: [],
            layout: 'grid',
            pics: []
        }};
    var fileType = '', fileSrc = '';

        clear: function () {
            service.model.datadirs = [];
            service.model.datadir = '';
            service.model.pics = [];
            service.model.layout = 'grid';
            return service;
        },
        fetch_images: function (datafiles) {
            var images = [];
            datafiles.forEach(function (item) {
                if (isImage(item.name)) {
                    fileSrc = "datafiles/static/" + item.id+"?apikey=" + User.apikey();
                    images.push({'file': item, 'link': fileSrc})
                }

            });

            return images;
        }
}]);
