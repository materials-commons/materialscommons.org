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
    DirOverviewDirectiveController.$inject = ["fileType", "Restangular", "mcfile"];

    function DirOverviewDirectiveController(fileType, Restangular, mcfile) {
        var ctrl = this;

        ctrl.viewFiles = viewFiles;
        ctrl.fileSrc = fileSrc;
        ctrl.isImage = isImage;
        ctrl.overview = _.values(fileType.overview(ctrl.dir.children));

        ////////////////

        function viewFiles(entry) {
            var fileIDs = entry.files.map(function (f) {
                return f.id;
            });
            Restangular.one('v2').one('projects', ctrl.project.id)
                .one('files').customPOST({file_ids: fileIDs})
                .then(function (files) {
                    ctrl.files = files;
                })
                .catch(function (err) {
                    console.log("error", err);
                });
        }

        function fileSrc(id) {
            return mcfile.src(id);
        }
    }
}(angular.module('materialscommons')));

