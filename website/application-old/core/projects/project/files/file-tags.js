(function (module) {
    module.directive('fileTags', fileTagsDirective);
    function fileTagsDirective() {
        return {
            restrict: "E",
            scope: {
                file: "="
            },
            controller: 'FileTagsDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: [
                '<h4 class="h4custom">Tags</h4>',
                '<tags-input on-tag-added="ctrl.updateTags()" display-property="tag_id"',
                '            on-tag-removed="ctrl.updateTags()" ng-model="ctrl.file.tags"',
                '            placeholder="Tags..." replace-spaces-with-dashes="false">',
                '</tags-input>'
            ].join(' ')
        };
    }

    module.controller('FileTagsDirectiveController', FileTagsDirectiveController);
    FileTagsDirectiveController.$inject = ['toastr'];

    function FileTagsDirectiveController(toastr) {
        var ctrl = this;

        ctrl.updateTags = updateTags;

        //////////////////////////

        function updateTags() {
            ctrl.file.customPUT({tags: ctrl.file.tags}).then(function () {
            }).catch(function (err) {
                toastr.error("Failed updating tags: " + err.error, "Error");
            });
        }
    }
}(angular.module('materialscommons')));
