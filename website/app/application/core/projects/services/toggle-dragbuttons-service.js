(function (module) {
    module.factory('toggleDragButton', [toggleDragButton]);

    function toggleDragButton() {
        var service = {
            addToReview: {
                'samples': false,
                'notes': false,
                'files': false,
                'provenance': false
            },
            addToProv: {
                samples: false,
                notes: false,
                files: false,
                provenance: false
            },

            toggle: function (type, button) {
                switch (type) {
                case "samples":
                    service[button].samples = !service[button].samples;
                    break;
                case "notes":
                    service[button].notes = !service[button].notes;
                    break;
                case "files":
                    service[button].files = !service[button].files;
                    break;
                case "provenance":
                    service[button].provenance = !service[button].provenance;
                    break;
                }
            },

            reset: function (button) {
                service[button] = {
                    'samples': false,
                    'notes': false,
                    'files': false,
                    'provenance': false
                };
            },

            get: function (type, button) {
                return service[button][type];
            }

        };

        return service;
    }
}(angular.module('materialscommons')));
