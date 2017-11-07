/*@ngInject*/
function fileTreeDeleteService(projectsAPIRoute) {

    function deleteProjectDir(projectID, dirID) {
        return projectsAPIRoute(projectID).one('directories', dirID).customDELETE();
    }

    function deleteProjectFile(projectID, fileID) {
        return projectsAPIRoute(projectID).one('files', fileID).customDELETE();
    }

    return {
        deleteDir: function(projectID, dirID) {
            return deleteProjectDir(projectID, dirID);
        },

        deleteFile: function(projectID, fileID) {
            return deleteProjectFile(projectID, fileID);
        }
    }
}

angular.module('materialscommons').factory('fileTreeDeleteService', fileTreeDeleteService);

