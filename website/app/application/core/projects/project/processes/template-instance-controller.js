(function (module) {
    module.controller('TemplateInstanceController', TemplateInstanceController);
    TemplateInstanceController.$inject = ["$scope", "project", "$state", "$log",
        "modal", "processTemplates", "Review", "modalInstance", "Restangular"];

    function TemplateInstanceController($scope, project, $state, $log,
                                        modal, processTemplates, Review, modalInstance,
                                        Restangular) {
        $scope.modal = modal;
        this.all = project.processes;

        $scope.showDetails = function (template) {
            $scope.selected.item = template;
            $scope.template_details = processTemplates.newInstance(template);
        };

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
                    $scope.favourites.push(template);
                    var index = _.indexOf($scope.templates, function (item) {
                        return item.name === template.name;
                    });
                    if (index > -1) {
                        $scope.templates[index].isFavorite = true;
                    }
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

                    var j = _.indexOf($scope.favourites, function (item) {
                        return item.name === template.name;
                    });
                    if (j > -1) {
                        $scope.favourites.splice(j, 1);
                    }
                })
        };

        $scope.ok = function () {
            Review.resetCheckedItems();
            $scope.modal.instance.close($scope.selected.item);
            processTemplates.setActiveTemplate($scope.selected.item);
            $state.go('projects.project.processes.create');
        };

        $scope.cancel = function () {
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
            $scope.favourites = [];
            $scope.prefilled = [];
            var instance = {};
            //Fill in pre-filled templates with setup
            project.process_templates.forEach(function (item) {
                if ('process_name' in item) {
                    instance = processTemplates.getTemplateByName(item.process_name);
                    instance.setup.settings[0] = item.setup;
                    instance.name = item.name;
                    $scope.prefilled.push(instance);
                }
            });
            //var user = User.attr();
            //var keys = Object.keys(user.favorites);
            //co
            //if(user.favorites){
            //    var values = user.favorites[keys[0]];
            //
            //}

            //if(values.processes !== 0){
            //    user.favorites[0].processes.forEach(function(item){
            //        instance = processTemplates.getTemplateByName(item);
            //        $scope.favourites.push(instance);
            //    })
            //}

            $scope.selected = {
                item: {}
            };
        }

        init();
    }
}(angular.module('materialscommons')));
