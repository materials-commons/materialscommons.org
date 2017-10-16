angular.module('materialscommons').factory('fileTreeMoveService', fileTreeMoveService);

function fileTreeMoveService(projectsAPIRoute, mcprojstore) {
    'ngInject';

    function moveFileOnServer(fileID, oldDirID, newDirID) {
        const moveArgs = {
            move: {
                old_directory_id: oldDirID,
                new_directory_id: newDirID
            }
        };
        const projectID = mcprojstore.currentProject.id;
        return projectsAPIRoute(projectID).one('files', fileID).customPUT(moveArgs);
    }

    function moveDirOnServer(dirID, newDirID) {
        const moveArgs = {
            move: {
                new_directory_id: newDirID
            }
        };
        const projectID = mcprojstore.currentProject.id;
        return projectsAPIRoute(projectID).one('directories', dirID).customPUT(moveArgs);
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
            const root = getTreeRoot();
            return moveFileOnServer(fileID, oldDirID, newDirID).then(function(f) {
                const fileNode = findNodeByID(root, fileID),
                    dirNode = findNodeByID(root, newDirID);
                fileNode.drop();
                dirNode.addChild(fileNode);
                return f;
            });
        },

        moveDir: function(dirID, newDirID) {
            const root = getTreeRoot();
            return moveDirOnServer(dirID, newDirID).then(function(d) {
                const dirNode = findNodeByID(root, dirID),
                    toDirNode = findNodeByID(root, newDirID);
                dirNode.drop();
                toDirNode.addChild(dirNode);
                return d;
            });
        }
    };
}
