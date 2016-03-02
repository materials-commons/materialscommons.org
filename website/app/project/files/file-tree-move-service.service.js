(function(module) {
    module.factory('fileTreeMoveService', fileTreeMoveService);
    fileTreeMoveService.$inject = ['projectsAPI', 'project'];
    function fileTreeMoveService(projectsAPI, project) {
        function moveFileOnServer(fileID, oldDirID, newDirID) {
            var moveArgs = {
                move: {
                    old_directory_id: oldDirID,
                    new_directory_id: newDirID
                }
            };
            var projectID = project.get().id;
            return projectsAPI(projectID).one('files', fileID).customPUT(moveArgs);
        }

        function moveDirOnServer(dirID, newDirID) {
            var moveArgs = {
                move: {
                    new_directory_id: newDirID
                }
            };
            var projectID = project.get().id;
            return projectsAPI(projectID).one('directories', dirID).customPUT(moveArgs);
        }

        function findNodeByID(root, id) {
            return root.first({strategy: 'pre'}, function(node) {
                return node.model.data.id === id;
            });
        }

        function getTreeRoot() {
            var files = project.get().files[0],
                treeModel = new TreeModel();
            return treeModel.parse(files);
        }

        return {
            moveFile: function(fileID, oldDirID, newDirID) {
                var root = getTreeRoot();
                return moveFileOnServer(fileID, oldDirID, newDirID).then(function(f) {
                    var fileNode = findNodeByID(root, fileID),
                        dirNode = findNodeByID(root, newDirID);
                    fileNode.drop();
                    dirNode.addChild(fileNode);
                    return f;
                });
            },

            moveDir: function(dirID, newDirID) {
                var root = getTreeRoot();
                return moveDirOnServer(dirID, newDirID).then(function(d) {
                    var dirNode = findNodeByID(root, dirID),
                        toDirNode = findNodeByID(root, newDirID);
                    dirNode.drop();
                    toDirNode.addChild(dirNode);
                    return d;
                });
            }
        };
    }
}(angular.module('materialscommons')));
