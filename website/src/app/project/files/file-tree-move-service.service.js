/*@ngInject*/
function fileTreeMoveService(projectsAPIRoute, mcprojstore) {

    function moveFileOnServer(fileID, oldDirID, newDirID) {
        const moveArgs = {
            move: {
                old_directory_id: oldDirID,
                new_directory_id: newDirID
            }
        };
        const projectID = mcprojstore.currentProject.id;
        return projectsAPIRoute(projectID).one('files', fileID).customPUT(moveArgs).then(f => f.plain());
    }

    function moveDirOnServer(dirID, newDirID) {
        const moveArgs = {
            move: {
                new_directory_id: newDirID
            }
        };
        const projectID = mcprojstore.currentProject.id;
        return projectsAPIRoute(projectID).one('directories', dirID).customPUT(moveArgs).then(d => d.plain());
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
        moveFile: function(fileID, oldDirID, newDirID) {
            return moveFileOnServer(fileID, oldDirID, newDirID).then(f => f);
        },

        moveDir: function(dirID, newDirID) {
            return moveDirOnServer(dirID, newDirID).then(d => d);
        },

        findNodeByID,
        getTreeRoot,
    };
}

angular.module('materialscommons').factory('fileTreeMoveService', fileTreeMoveService);