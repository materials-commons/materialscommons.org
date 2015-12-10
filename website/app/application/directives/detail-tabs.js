(function (module) {
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

        if(ctrl.item._type === 'process' ){
            ctrl.setActive('setup');
        }else if (ctrl.item._type === 'sample' ){
            ctrl.setActive('processes');
        }
        //////////////////

        function setActive(tab) {
            ctrl.activeTab = tab;
        }

        function isActive(tab) {
            return ctrl.activeTab === tab;
        }

        function loadTabs() {
            var tabs = [];

            if ('setup' in ctrl.item) {
                tabs.push(newTab('setup', 'fa-cogs', ctrl.item.setup[0].properties.length));
            }

            if ('notes' in ctrl.item) {
                tabs.push(newTab('notes', 'fa-sticky-note', ctrl.item.notes.length));
            }

            if ('reviews' in ctrl.item) {
                tabs.push(newTab('reviews', 'fa-comment', ctrl.item.reviews.length));
            }

            if ('processes' in ctrl.item) {
                tabs.push(newTab('processes', 'fa-code-fork', ctrl.item.processes.length));
            }

            if ('linked_files' in ctrl.item) {
                tabs.push(newTab('files', 'fa-files-o', ctrl.item.linked_files.length));
            }

            if ('input_files' in ctrl.item) {
                tabs.push(newTab('input files', 'fa-files-o', ctrl.item.input_files.length));
            }

            if ('output_files' in ctrl.item) {
                tabs.push(newTab('output files', 'fa-files-o', ctrl.item.output_files.length));
            }

            if ('input_samples' in ctrl.item) {
                tabs.push(newTab('samples', 'fa-cubes', ctrl.item.input_samples.length));
            } else if ('samples' in ctrl.item) {
                tabs.push(newTab('samples', 'fa-cubes', ctrl.item.samples.length));
            }


            tabs.sort(function compareByName(t1, t2) {
                if (t1.name > t2.name) {
                    return -1;
                }
                if (t1.name < t2.name) {
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