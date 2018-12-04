/*@ngInject*/
function fileTreeMoveService(projectsAPIRoute, mcprojstore) {

    function moveFileOnServer(projectId, fileID, oldDirID, newDirID) {
        const moveArgs = {
            move: {
                old_directory_id: oldDirID,
                new_directory_id: newDirID
            }
        };
        return projectsAPIRoute(projectId).one('files', fileID).customPUT(moveArgs).then(f => f.plain());
    }

    function moveDirOnServer(projectId, dirID, newDirID) {
        const moveArgs = {
            move: {
                new_directory_id: newDirID
            }
        };
        return projectsAPIRoute(projectId).one('directories', dirID).customPUT(moveArgs).then(d => d.plain());
    }

    function findNodeByID(root, id) {
        return root.first({strategy: 'pre'}, function(node) {
            return node.model.data.id === id;
        });
    }

    function getTreeRoot() {
        const files = mcprojstore.currentProject.files[0],
            treeModel = new TreeModel();
        return treeModel.parse(files);
    }

    return {
        moveFile: function(projectId, fileID, oldDirID, newDirID) {
            return moveFileOnServer(projectId, fileID, oldDirID, newDirID).then(f => f);
        },

        moveDir: function(projectId, dirID, newDirID) {
            return moveDirOnServer(projectId, dirID, newDirID).then(d => d);
        },

        findNodeByID,
        getTreeRoot,
    };
}

angular.module('materialscommons').factory('fileTreeMoveService', fileTreeMoveService);