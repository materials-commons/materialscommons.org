(function (module) {
    module.directive("displayImageTab", displayImageDirective);

    function displayImageDirective() {
        return {
            scope: {
                sampleObj : "="
            },
            restrict: "E",
            controller: "displayImageTabDirectiveController",
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: "application/core/projects/project/processes/display-image-tab.html"
        };
    }

    module.controller("displayImageTabDirectiveController", displayImageTabDirectiveController);
    displayImageTabDirectiveController.$inject = ["mcfile"];

    function displayImageTabDirectiveController(mcfile) {
        var imageCtrl = this;
        imageCtrl.images = images;
        imageCtrl.fileSrc = fileSrc;

        function images(files) {
            var images = [s];
            if (files){
                files.forEach(function (f) {
                    if (isImage(f.mediatype.mime)) {
                        images.push(f);
                    }
                });
            }
            return images;
        }

        function fileSrc(id) {
            return mcfile.src(id);
        }
    }
}(angular.module('materialscommons')));
