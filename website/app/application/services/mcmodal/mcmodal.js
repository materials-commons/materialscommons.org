(function (module) {
    module.factory('mcmodal', mcmodalService);
    mcmodalService.$inject = ["$modal", "mcapi"];
    function mcmodalService($modal, mcapi) {
        var service = {
            modal: {},
            openModal: function (item, type, project) {
                service.modal = {
                    instance: null,
                    item: {}
                };
                var template = '';
                switch (type) {
                case "datafile":
                    template = 'application/core/projects/project/home/directives/display-file.html';
                    service.modal.item = item;
                    break;
                case "sample":
                    template = 'application/core/projects/project/home/directives/display-sample.html';
                    mcapi('/sample/measurements/%/%', item.id, item.property_set_id)
                        .success(function (properties) {
                            item.properties = properties;
                            service.modal.item = item;
                        })
                        .error(function (err) {
                            console.log(err)
                        })
                        .jsonp();
                    mcapi('/sample/datafile/%', item.id)
                        .success(function (files) {
                            item.linked_files = files;
                        }).jsonp();
                    break;
                case "process":
                    template = 'application/core/projects/project/home/directives/display-process.html';
                    service.modal.item = item;
                    break;
                }

                service.modal.instance = $modal.open({
                    size: 'lg',
                    templateUrl: template,
                    controller: 'DisplaySampleController',
                    resolve: {
                        modal: function () {
                            return service.modal;
                        },
                        project: function () {
                            return project;
                        }
                    }
                });
                return service.modal.instance;
            },

            chooseTemplate: function (project, templates) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/services/mcmodal/partials/template.html',
                    controller: 'TemplatesModalController',
                    controllerAs: 'ctrl',
                    resolve: {
                        project: function () {
                            return project;
                        },
                        templates: function () {
                            return templates;
                        }
                    }
                });
                return modal.result;
            },

            viewSetup: function (template) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/services/mcmodal/partials/view_setup.html',
                    controller: 'setupViewController',
                    controllerAs: 'ctrl',
                    resolve: {
                        template: function () {
                            return template;
                        }
                    }
                });
                return modal.result;
            },

            preFill: function (template, existingTemplateNames) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/services/mcmodal/partials/prefill.html',
                    controller: 'PreFillProcessController',
                    controllerAs: 'ctrl',
                    resolve: {
                        template: function () {
                            return template;
                        },
                        existingTemplateNames: function() {
                            return existingTemplateNames ? existingTemplateNames : [];
                        }
                    }
                });
                return modal.result;
            }
        };
        return service;
    }
}(angular.module('materialscommons')));
