Application.Services.factory('Thumbnail', [ "User", function (User) {
    var fileType = '', fileSrc = '';
    return {
        fetch_images: function (datafiles) {
            var images = [];
            datafiles.forEach(function (item) {
                if (isImage(item.name)) {
                    fileSrc = "datafiles/static/" + item.id + "?apikey=" + User.apikey();
                    images.push({'file': item, 'link': fileSrc});
                }

            });

            return images;
        }
    }
}]);
