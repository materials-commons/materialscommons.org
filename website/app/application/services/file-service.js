Application.Services.factory("file", fileService);

function fileService() {
    var self = this;

    return {
        save: function (file) {
            self.file = file;
            return self;
        },
        getFile: function () {
            return self.file;
        }
    };
}
