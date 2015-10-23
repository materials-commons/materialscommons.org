(function (module) {
    module.factory('selectItems', selectItemsService);

    selectItemsService.$inject = ["$modal"];
    function selectItemsService($modal) {
        return {
            open: function () {
                var tabs = {
                    processes: false,
                    files: false,
                    samples: false,
                    reviews: false
                };

                if (arguments.length === 0) {
                    throw "Invalid arguments to service selectItems:open()";
                }

                for (var i = 0; i < arguments.length; i++) {
                    tabs[arguments[i]] = true;
                }

                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/services/partials/select-items.html',
                    controller: 'SelectItemsServiceModalController',
                    controllerAs: 'ctrl',
                    resolve: {
                        showProcesses: function () {
                            return tabs.processes;
                        },

                        showFiles: function () {
                            return tabs.files;
                        },

                        showSamples: function () {
                            return tabs.samples;
                        },

                        showReviews: function () {
                            return tabs.reviews;
                        }
                    }
                });
                return modal.result;
            }
        };
    }

    module.controller('SelectItemsServiceModalController', SelectItemsServiceModalController);
    SelectItemsServiceModalController.$inject = ['$modalInstance', 'showProcesses',
        'showFiles', 'showSamples', 'showReviews', 'Restangular', '$stateParams', 'current'];

    function SelectItemsServiceModalController($modalInstance, showProcesses, showFiles, showSamples,
                                               showReviews, Restangular, $stateParams, current) {
        var ctrl = this;

        ctrl.tabs = loadTabs();
        ctrl.activeTab = ctrl.tabs[0].name;
        ctrl.setActive = setActive;
        ctrl.isActive = isActive;
        ctrl.ok = ok;
        ctrl.cancel = cancel;
        ctrl.processes = [];
        ctrl.samples = [];
        ctrl.files = current.project().files;
        console.dir(ctrl.files);

        /////////////////////////

        function setActive(tab) {
            ctrl.activeTab = tab;
        }

        function isActive(tab) {
            return ctrl.activeTab === tab;
        }

        function ok() {
            var selectedProcesses = ctrl.processes.filter(function (p) {
                return p.input || p.output;
            });

            var selectedSamples = ctrl.samples.filter(function (s) {
                return s.selected;
            });

            $modalInstance.close({
                processes: selectedProcesses,
                samples: selectedSamples
            });
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function loadTabs() {
            var tabs = [];
            if (showProcesses) {
                tabs.push(newTab('processes', 'fa-code-fork'));
                Restangular.one('v2').one('projects', $stateParams.id).one('processes').get().then(function (p) {
                    ctrl.processes = p;
                });
            }

            if (showSamples) {
                tabs.push(newTab('samples', 'fa-cubes'));
                Restangular.one('v2').one('projects', $stateParams.id).one('samples').get().then(function (samples) {
                    console.dir(samples);
                    ctrl.samples = samples;
                });
            }

            if (showFiles) {
                tabs.push(newTab('files', 'fa-files-o'));
            }

            if (showReviews) {
                tabs.push(newTab('reviews', 'fa-comment'));
            }

            tabs.sort(function compareByName(t1, t2) {
                if (t1.name < t2.name) {
                    return -1;
                }
                if (t1.name > t2.name) {
                    return 1;
                }
                return 0;
            });

            return tabs;
        }

        function newTab(name, icon) {
            return {
                name: name,
                icon: icon
            };
        }
    }
}(angular.module('materialscommons')));
