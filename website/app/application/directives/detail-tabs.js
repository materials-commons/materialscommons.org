(function(module) {
    module.directive('detailTabs', detailTabsDirective);
    function detailTabsDirective() {
        return {
            restrict: 'E',
            scope: {
                item: '='
            },
            controller: 'DetailTabsDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/directives/partials/detail-tabs.html'
        };
    }

    module.controller('DetailTabsDirectiveController', DetailTabsDirectiveController);
    DetailTabsDirectiveController.$inject = [];
    function DetailTabsDirectiveController() {
        var ctrl = this;
        ctrl.tabs = loadTabs();
        ctrl.activeTab = ctrl.tabs.length ? ctrl.tabs[0].name : '';
        ctrl.setActive = setActive;
        ctrl.isActive = isActive;

        //////////////////

        function setActive(tab) {
            ctrl.activeTab = tab;
        }

        function isActive(tab) {
            return ctrl.activeTab === tab;
        }

        function loadTabs() {
            var tabs = [];

            if ('notes' in ctrl.item && ctrl.item.notes.length) {
                tabs.push(newTab('notes', 'fa-sticky-note', ctrl.item.notes.length));
            }

            if ('reviews' in ctrl.item && ctrl.item.reviews.length) {
                tabs.push(newTab('reviews', 'fa-comment', ctrl.item.reviews.length));
            }

            if ('processes' in ctrl.item && ctrl.item.processes.length) {
                tabs.push(newTab('processes', 'fa-code-fork', ctrl.item.processes.length));
            }

            if ('files' in ctrl.item && ctrl.item.files.length) {
                tabs.push(newTab('files', 'fa-files-o', ctrl.item.files.length));
            }

            if ('samples' in ctrl.item && ctrl.item.samples.length) {
                tabs.push(newTab('samples', 'fa-cubes', ctrl.item.samples.length));
            }

            if ('measurements' in ctrl.item && ctrl.item.measurements.length) {
                tabs.push(newTab('measurements', 'fa-flask', ctrl.item.measurements.length));
            } else if ('property_sets' in ctrl.item && ctrl.item.property_sets.length) {
                tabs.push(newTab('measurements', 'fa-flask', ctrl.item.property_sets.length));
            }

            if ('setup' in ctrl.item && ctrl.item.setup[0].properties.length) {
                tabs.push(newTab('setup', 'fa-cogs', ctrl.item.setup[0].properties.length));
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

        function newTab(name, icon, count) {
            return {
                name: name,
                icon: icon,
                count: count
            };
        }
    }
}(angular.module('materialscommons')));