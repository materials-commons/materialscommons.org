(function (module) {
    module.controller('TemplateInstanceController', TemplateInstanceController);
    TemplateInstanceController.$inject = ["$scope", "project", "$state", "$log",
        "modal", "processTemplates", "modalInstance", "Restangular", "User"];

    function TemplateInstanceController($scope, project, $state, $log,
                                        modal, processTemplates, modalInstance,
                                        Restangular, User) {
        $scope.modal = modal;
        this.all = project.processes;
        $scope.project_favorites = [];

        $scope.viewSetUp = function (template) {
            $scope.template_details = processTemplates.newInstance(template);
            modalInstance.viewSetUp($scope.template_details.setup.settings[0].properties);
        };

        $scope.openPreFill = function (template) {
            $scope.showDetails(template);
            modalInstance.preFill($scope.template_details, project).then(function (t) {
                $scope.prefilled.push(t);
            });
        };

        $scope.addToFavourite = function (template) {
            Restangular.one('v2').one('users', project.id)
                .customPUT({
                    favorites: {
                        processes: [
                            {
                                command: 'add',
                                name: template.name
                            }
                        ]
                    }
                }).then(function () {
                    $scope.project_favorites.push(template.name);
                    var index = _.indexOf($scope.templates, function (item) {
                        return item.name === template.name;
                    });
                    if (index > -1) {
                        $scope.templates[index].isFavorite = true;
                    }
                    $scope.user.favorites[project.id].processes = $scope.project_favorites;
                    User.save();
                });
        };

        $scope.removeFromFavourite = function (template) {
            Restangular.one('v2').one('users', project.id)
                .customPUT({
                    favorites: {
                        processes: [
                            {
                                command: 'delete',
                                name: template.name
                            }
                        ]
                    }
                }).then(function () {
                    var index = _.indexOf($scope.templates, function (item) {
                        return item.name === template.name;
                    });
                    if (index > -1) {
                        $scope.templates[index].isFavorite = false;
                    }

                    var j = _.indexOf($scope.project_favorites, function (item) {
                        return item === template.name;
                    });
                    if (j > -1) {
                        $scope.project_favorites.splice(j, 1);
                    }
                    $scope.user.favorites[project.id].processes = $scope.project_favorites;
                    User.save();
                })
        };

        $scope.selectTemplate = function (template) {
            $scope.selected.item = template;
            $scope.modal.instance.close($scope.selected.item);
            processTemplates.setActiveTemplate($scope.selected.item);
            $state.go('projects.project.processes.create');
        };

        $scope.dismiss = function () {
            $scope.modal.instance.dismiss('cancel');
        };

        $scope.isActive = function (tab) {
            return $scope.activeTab === tab;
        };

        $scope.setActive = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });

        $scope.choosePrefilledTemplate = function (template) {
            $scope.selected.item = template;
            $scope.template_details = template;
        };

        $scope.viewPrefilledSetUp = function (template) {
            $scope.template_details = template;
            modalInstance.preFill($scope.template_details, project);
        };

        function init() {
            $scope.templates = processTemplates.templates();
            $scope.setActive('all');
            $scope.prefilled = [];
            var instance = {};
            // Fill in pre-filled templates with setup
            project.process_templates.forEach(function (item) {
                if ('process_name' in item) {
                    instance = processTemplates.getTemplateByName(item.process_name);
                    instance.setup.settings[0] = item.setup;
                    instance.name = item.name;
                    $scope.prefilled.push(instance);
                }
            });
            $scope.user = User.attr();
            // Get fav processes for a project
            if (project.id in $scope.user.favorites) {
                    $scope.project_favorites = $scope.user.favorites[project.id].processes || [];
            } else {
                $scope.user.favorites[project.id] = {
                    processes: []
                };
            }

            // Reset all template favorites to false.
            $scope.templates.forEach(function(t) {
                t.isFavorite = false;
            });

            // set isFavorite field in all the templates
            $scope.project_favorites.forEach(function (fav) {
                var index = _.indexOf($scope.templates, function (item) {
                    return item.name === fav;
                });
                if (index !== -1) {
                    $scope.templates[index].isFavorite = true;
                }
            });

            $scope.selected = {
                item: {}
            };
        }

        init();
    }
}(angular.module('materialscommons')));
