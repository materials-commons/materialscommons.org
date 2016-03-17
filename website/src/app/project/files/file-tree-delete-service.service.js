angular.module('materialscommons').factory('fileTreeDeleteService', fileTreeDeleteService);

function fileTreeDeleteService(projectTreeModel, projectsAPI, toastr) {
    function deleteProjectDir(projectID, dirID) {
        return projectsAPI(projectID).one('directories', dirID).customDELETE();
    }

    return {
        deleteDir: function(projectID, dirID) {
            return deleteProjectDir(projectID, dirID).then(
                () => {
                    let root = projectTreeModel.root(),
                        dirNode = projectTreeModel.findNodeByID(root, dirID);
                    if (dirNode) {
                        dirNode.drop();
                    }
                },

                (err) => {
                    let msg = err.error ? err.error : 'Unknown error';
                    toastr.error(msg, 'Error', {closeButton: true});
                }
            );
        }
    }
}
