Application.Services.factory("mcfile", ["User", mcfileService]);
function mcfileService(User) {
    return {
        src: function (fileID) {
            var apikey = User.apikey();
            var url = "datafiles/static/" + fileID + "?apikey=" + apikey;
            return url;
        },

        downloadSrc: function (fileID) {
            var apikey = User.apikey();
            var url = "datafiles/static/" + fileID + "?apikey=" + apikey + "&original=true";
            return url;
        }
    };
}
