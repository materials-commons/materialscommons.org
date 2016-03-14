(function (module) {
    module.factory("mcfile", ["User", mcfileService]);
    function mcfileService(User) {
        return {
            src: function (fileID) {
                var apikey = User.apikey();
                return "datafiles/static/" + fileID + "?apikey=" + apikey;
            },

            downloadSrc: function (fileID) {
                var apikey = User.apikey();
                return "datafiles/static/" + fileID + "?apikey=" + apikey + "&original=true";
            }
        };
    }
}(angular.module('materialscommons')));
