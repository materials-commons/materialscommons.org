(function (module) {
    module.directive("displayImageTab", displayImageDirective);

    function displayImageDirective() {
        return {
            scope: {
                sample: "="
            },
            restrict: "E",
            controller: "displayImageTabDirectiveController",
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: "application/core/projects/project/processes/display-image-tab.html"
        };
    }

    module.controller("displayImageTabDirectiveController", displayImageTabDirectiveController);
    displayImageTabDirectiveController.$inject = ["mcfile", "mcmodal"];

    function displayImageTabDirectiveController(mcfile, mcmodal) {
        var imageCtrl = this;
        imageCtrl.images = images;
        imageCtrl.fileSrc = fileSrc;
        imageCtrl.showImage = showImage;

        function images(files) {
            var images = [];
            if (files) {
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

        function showImage(file){
            mcmodal.viewImage(file);
        }
    }
}(angular.module('materialscommons')));
