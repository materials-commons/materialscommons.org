(function (module) {
    module.directive('dirOverview', dirOverviewDirective);
    function dirOverviewDirective() {
        return {
            restrict: "E",
            scope: {
                dir: "=",
                project: "="
            },
            controller: 'DirOverviewDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/files/dir-overview.html'
        };
    }

    module.controller('DirOverviewDirectiveController', DirOverviewDirectiveController);
    DirOverviewDirectiveController.$inject = ["fileType", "mcfile", "$filter", "Restangular",
        "User", "current", "mcmodal"];

    function DirOverviewDirectiveController(fileType, mcfile, $filter, Restangular,
                                            User, current, mcmodal) {
        var ctrl = this;

        ctrl.viewFiles = viewFiles;
        ctrl.fileSrc = mcfile.src;
        ctrl.isImage = isImage;
        ctrl.overview = _.values(fileType.overview(ctrl.dir.children));
        ctrl.allFiles = {
            files: allFiles()
        };
        ctrl.selectedCount = 0;
        ctrl.downloadSelectedFiles = downloadSelectedFiles;
        ctrl.shareSelectedFiles = shareSelectedFiles;
        ctrl.fileSelect = fileSelect;
        ctrl.selectAllFiles = selectAllFiles;
        ctrl.deselectSelectedFiles = deselectSelectedFiles;
        ctrl.files = ctrl.allFiles.files;
        ctrl.fileFilter = {
            name: ''
        };
        ctrl.downloadState = 'none';
        ctrl.downloadURL = '';
        ctrl.downloadMessageFlash = '';

        ////////////////

        function allFiles() {
            return ctrl.dir.children.filter(function (f) { return f.data._type !== "directory"; })
                .map(function (f) {
                    f.data.selected = false;
                    return f.data;
                });
        }

        function viewFiles(entry) {
            ctrl.files = entry.files.map(function (f) {
                f.selected = false;
                return f;
            });
            ctrl.selectedCount = 0;
        }

        function fileSelect(file) {
            if (file.selected) {
                ctrl.selectedCount--;
            } else {
                ctrl.selectedCount++;
            }
            file.selected = !file.selected;
        }

        function selectAllFiles() {
            var filesToSelect = $filter('filter')(ctrl.files, ctrl.fileFilter);
            filesToSelect.forEach(function (f) {
                f.selected = true;
            });
            ctrl.selectedCount = ctrl.files.length;
        }

        function deselectSelectedFiles() {
            ctrl.files.forEach(function (f) {
                if (f.selected) {
                    f.selected = false;
                }
            });
            ctrl.selectedCount = 0;
        }

        function downloadSelectedFiles() {
            ctrl.downloadState = 'preparing';
            var fileIDs = ctrl.files.filter(function (f) { return f.selected; }).map(function (f) { return f.id});
            Restangular.one("project2").one("archive").customPOST({
                file_ids: fileIDs
            }).then(
                function success(resp) {
                    ctrl.downloadURL = "api/project2/download/archive/" + resp.archive_id + ".zip?apikey=" + User.apikey();
                    ctrl.downloadState = 'done';
                    deselectSelectedFiles();
                },

                function failure() {
                    console.log('archive creation failed');
                }
            );
        }

        function shareSelectedFiles() {
            var toUserName = function (u) { return u.user_id;};
            var users = current.project().users.map(toUserName);
            mcmodal.chooseUsers(users).then(function(chosenUsers) {
                console.log('users chosen', chosenUsers);
            })
        }
    }
}(angular.module('materialscommons')));

