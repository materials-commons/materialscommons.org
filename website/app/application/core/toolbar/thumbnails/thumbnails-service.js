Application.Services.factory('Thumbnails', [function () {
    var service = {
        model: {
            datadir: '',
            datadirs: [],
            layout: 'grid',
            pics: []
        },

        clear: function () {
            service.model.datadirs = [];
            service.model.datadir = '';
            service.model.pics = [];
            service.model.layout = 'grid';
        }
    };
    return service;
}]);