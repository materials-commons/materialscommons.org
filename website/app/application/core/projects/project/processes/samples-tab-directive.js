(function (module) {
    module.directive("samplesTab", samplesTabDirective);

    function samplesTabDirective() {
        return {
            scope: true,
            restrict: "E",
            //controller: "samplesTabDirectiveController",
            //controllerAs: 'samplesTab',
            //bindToController: true,
            templateUrl: "application/core/projects/project/processes/samples.html"
        };
    }

    //module.controller("samplesTabDirectiveController", samplesTabDirectiveController);
    //samplesTabDirectiveController.$inject = [];
    //
    //function samplesTabDirectiveController() {
    //    var samplesTabCtrl = this;
    //
    //    samplesTabCtrl.images = images;
    //
    //    function images(files) {
    //        var images = [];
    //        files.forEach(function (f) {
    //            if (isImage(f.mediatype.mime)) {
    //                images.push(f);
    //            }
    //        });
    //        return images;
    //    }
    //}
}(angular.module('materialscommons')));
