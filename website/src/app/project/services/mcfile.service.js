angular.module('materialscommons').factory('mcfile', mcfileService);

/*@ngInject*/
function mcfileService(User) {
    return {
        src: (fileId) => `api/v2/files/${fileId}/download?apikey=${User.apikey()}`,
        downloadSrc: (fileId) => `api/v2/files/${fileId}/download?apikey=${User.apikey()}&original=true`,
        isMSExcel: (mime) => {
            switch (mime) {
                case 'application/vnd.ms-excel':
                    return true;
                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    return true;
                default:
                    return false;
            }
        },
    };
}
