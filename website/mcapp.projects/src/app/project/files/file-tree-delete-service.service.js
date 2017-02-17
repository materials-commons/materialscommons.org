angular.module('materialscommons').factory('fileTreeDeleteService', fileTreeDeleteService);

function fileTreeDeleteService(projectTreeModel, projectsAPI, toast) {

    function deleteProjectDir(projectID, dirID) {
        return projectsAPI(projectID).one('directories', dirID).customDELETE();
    }

    function deleteProjectFile(projectID, fileID) {
        return projectsAPI(projectID).one('files', fileID).customDELETE();
    }

    function dropNode(id) {
        let root = projectTreeModel.root(),
            node = projectTreeModel.findNodeByID(root, id);
        if (node) {
            node.drop();
        }
        return true;
    }

    function displayError(err) {
        let msg = getErrorMessage(err);
        toast.error(msg);
        return false;
    }

    function getErrorMessage(err) {
        if (err.error) {
            return err.error;
        } else if (err.data && err.data.error) {
            return err.data.error;
        } else {
            return 'Unknown error';
        }
    }

    return {
        deleteDir: function(projectID, dirID) {
            return deleteProjectDir(projectID, dirID).then(
                () => dropNode(dirID),
                (err) => displayError(err)
            );
        },

        deleteFile: function(projectID, fileID) {
            return deleteProjectFile(projectID, fileID).then(
                () => dropNode(fileID),
                (err) => displayError(err)
            );
        }
    }
}
