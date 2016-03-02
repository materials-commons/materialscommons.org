(function(module) {
    module.factory('fileTreeMoveService', fileTreeMoveService);
    fileTreeMoveService.$inject = ['projectsAPI', 'project'];
    function fileTreeMoveService(projectsAPI, project) {
        function moveFileOnServer(projectID, fileID, oldDirID, newDirID) {
            var moveArgs = {
                move: {
                    old_directory_id: oldDirID,
                    new_directory_id: newDirID
                }
            };
            return projectsAPI(projectID).one('files', fileID).customPUT(moveArgs);
        }

        function moveDirOnServer(projectID, dirID, newDirID) {
            var moveArgs = {
                move: {
                    new_directory_id: newDirID
                }
            };
            return projectsAPI(projectID).one('directories', dirID).customPUT(moveArgs);
        }

        return {
            moveFile: function(fileID, oldDirID, newDirID) {
                
            },

            moveDir: function(dirID, newDirID) {

            }
        };
    }
}(angular.module('materialscommons')));
