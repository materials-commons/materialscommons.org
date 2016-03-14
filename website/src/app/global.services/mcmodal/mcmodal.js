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
                    console.dir(item);
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
                    templateUrl: 'app/global.services/mcmodal/partials/template.html',
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

            chooseUsers: function(users) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'app/global.services/mcmodal/partials/choose-users.html',
                    controller: 'ChooseUsersController',
                    controllerAs: 'ctrl',
                    resolve: {
                        userslist: function() {
                            return users;
                        }
                    }
                });
                return modal.result;
            },

            chooseExistingProcess: function (processes) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'app/global.services/mcmodal/partials/existing-process.html',
                    controller: 'existingProcessController',
                    controllerAs: 'ctrl',
                    resolve: {
                        processes: function () {
                            return processes;
                        }
                    }
                });
                return modal.result;
            },

            viewSetup: function (template) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'app/global.services/mcmodal/partials/view_setup.html',
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
                    templateUrl: 'app/global.services/mcmodal/partials/prefill.html',
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
            },

            viewImage: function (file) {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'app/global.services/mcmodal/partials/image.html',
                    controller: 'ImageController',
                    controllerAs: 'ctrl',
                    resolve: {
                        file: function () {
                            return file;
                        }
                    }
                });
                return modal.result;
            }

        };
        return service;
    }
}(angular.module('materialscommons')));
