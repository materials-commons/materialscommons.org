angular.module('materialscommons').factory("mcfile", mcfileService);

/*@ngInject*/
function mcfileService(User) {
    return {
        src: (fileId) => `api/v2/files/${fileId}/download?apikey=${User.apikey()}`,
        downloadSrc: (fileId) => `api/v2/files/${fileId}/download?apikey=${User.apikey()}&original=true`,

        srcOld: (fileId) => `api/datafiles/static/${fileId}?apikey=${User.apikey()}`,
        downloadSrcOld: (fileId) => `api/datafiles/static/${fileId}?apikey=${User.apikey()}&original=true`
    };
}
