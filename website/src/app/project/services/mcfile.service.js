angular.module('materialscommons').factory("mcfile", mcfileService);
function mcfileService(User) {
    'ngInject';

    return {
        src: function(fileID) {
            var apikey = User.apikey();
            return "api/datafiles/static/" + fileID + "?apikey=" + apikey;
        },

        downloadSrc: function(fileID) {
            var apikey = User.apikey();
            return "api/datafiles/static/" + fileID + "?apikey=" + apikey + "&original=true";
        }
    };
}
