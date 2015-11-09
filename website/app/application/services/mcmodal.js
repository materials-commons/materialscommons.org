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
                    templateUrl: 'application/core/projects/project/processes/template.html',
                    controller: 'TemplateInstanceController',
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

            viewSetup: function (properties) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/core/projects/project/processes/view_setup.html',
                    controller: 'setupViewController',
                    controllerAs: 'ctrl',
                    resolve: {
                        properties: function () {
                            return properties;
                        }
                    }
                });
                return modal.result;
            },

            preFill: function (template, project) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/core/projects/project/processes/prefill.html',
                    controller: 'projectPreFillProcess',
                    controllerAs: 'ctrl',
                    resolve: {
                        template: function () {
                            return template;
                        },
                        project: function () {
                            return project;
                        }
                    }
                });
                return modal.result;
            }
        };
        return service;
    }
}(angular.module('materialscommons')));
