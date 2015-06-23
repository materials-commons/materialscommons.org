Application.Services.factory('modalInstance',
    ["$modal", function ($modal) {
        var service = {
            modal: {},
            openModal: function (item, project) {
                service.modal = {
                    instance: null,
                    items: [item]
                };

                var template = '';
                switch (item.type) {
                    case "datafile":
                        template = 'application/core/projects/project/home/directives/display-file.html';
                        break;
                    case "sample":
                        template = 'application/core/projects/project/home/directives/display-sample.html';
                        break;
                    case "process":
                        template = 'application/core/projects/project/home/directives/display-process.html';
                        break;
                }
                service.modal.instance = $modal.open({
                    size: 'lg',
                    templateUrl: template,
                    controller: 'ModalInstanceCtrl',
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
            chooseTemplate: function (project) {
                service.modal = {
                    instance: null,
                    items: []
                };

                service.modal.instance = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/core/projects/project/processes/template.html',
                    controller: 'TemplateInstanceController',
                    resolve: {
                        modal: function () {
                            return service.modal;
                        },
                        project: function () {
                            return project;
                        }
                    }
                });
            }
        };
        return service;
    }]);
