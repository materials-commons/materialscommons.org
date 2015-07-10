Application.Services.factory('modalInstance',
    ["$modal", "mcapi", function ($modal, mcapi) {
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
                        //mcapi('/datafile/%/tags/notes', item.id)
                        //    .success(function (data) {
                        //        console.log(data);
                        //        service.modal.item = item;
                        //    })
                        //    .error(function (err) {
                        //        console.log(err)
                        //    })
                        //    .jsonp();
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
