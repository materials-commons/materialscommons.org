(function (module) {
    module.directive('mcTree', mcTreeDirective);

    function mcTreeDirective() {
        return {
            restrict: "E",
            scope: {
                items: '=items',
                orderby: '=orderby',
                matches: '=matches',
                attachment: '='
            },
            templateUrl: 'application/directives/mc-tree.html'
        };
    }

    module.directive('mcTreeHeader', [mcTreeHeaderDirective]);

    function mcTreeHeaderDirective() {
        return {
            restrict: "E",
            scope: {
                item: '=item',
                showSideboard: "=showSideboard",
                attachment: '='
            },
            controller: "mcTreeHeaderDirectiveController",
            templateUrl: 'application/directives/mc-tree-header.html'
        };
    }

    module.directive('mcTreeDir', ["RecursionHelper", mcTreeDirDirective]);

    function mcTreeDirDirective(RecursionHelper) {
        return {
            restrict: "E",
            scope: {
                item: '=item'
            },
            controller: "mcTreeDirDirectiveController",
            replace: true,
            templateUrl: 'application/directives/mc-tree-dir.html',
            compile: function (element) {
                return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                });
            }
        };
    }

    module.controller("mcTreeDirDirectiveController", mcTreeDirDirectiveController);
    mcTreeDirDirectiveController.$inject = ["$scope"];

    function mcTreeDirDirectiveController($scope) {
        $scope.items = $scope.item.children;
    }


    module.controller("mcTreeHeaderDirectiveController", mcTreeHeaderDirectiveController);
    mcTreeHeaderDirectiveController.$inject = ["$scope", "pubsub", "projectFiles", "current", "toggleDragButton",
        "mcapi", "$state"];

    function mcTreeHeaderDirectiveController($scope, pubsub, projectFiles, current, toggleDragButton, mcapi, $state) {
        if ($scope.item.type === "datadir") {
            $scope.tooltip = "Upload to directory";
            $scope.faClass = "fa-upload";
        } else {
            $scope.tooltip = "Download file";
            $scope.faClass = "fa-download";
        }

        pubsub.waitOn($scope, "activeFile.change", function () {
            getActiveFile();
        });
        function getActiveFile() {
            $scope.activeFile = projectFiles.getActiveFile();
        }

        $scope.addItem = function () {
            if ($scope.item.selected) {
                $scope.item.selected = !$scope.item.selected;
            } else {
                $scope.item.selected = true;
            }
            pubsub.send('addFileToReview', $scope.item);
        };

        $scope.newFolder = function (currentDir, name) {
            mcapi('/datadirs')
                .success(function (datadir) {
                    currentDir.addFolder = false;
                    currentDir.children.push(datadir);
                })
                .post({
                    project_id: current.projectID(),
                    parent: currentDir.id,
                    name: currentDir.name + "/" + name,
                    level: currentDir.level + 1
                });
        };
        $scope.openFile = function (item) {
            projectFiles.setActiveFile(item);
            $state.go('projects.project.files.edit', {'file_id': item.id});
        };

        $scope.isActive = function (type, button) {
            return toggleDragButton.get(type, button);
        };

    }

    module.directive("mcTreeDisplayItem", mcTreeDisplayItemDirective);

    function mcTreeDisplayItemDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                item: "=item",
                showSideboard: "=showSideboard"
            },
            templateUrl: "application/directives/mc-tree-display-item.html"
        };
    }

    module.directive('mcTreeLeaf', mcTreeLeafDirective);

    function mcTreeLeafDirective() {
        return {
            restrict: "E",
            scope: {
                item: '=item'
            },
            controller: "mcTreeLeafDirectiveController",
            replace: true,
            templateUrl: 'application/directives/mc-tree-leaf.html'
        };
    }

    module.controller("mcTreeLeafDirectiveController", mcTreeLeafDirectiveController);
    mcTreeLeafDirectiveController.$inject = ["$scope", "User", "mcfile"];

    function mcTreeLeafDirectiveController($scope, User, mcfile) {
        $scope.apikey = User.apikey();

        $scope.fileSrc = function (file) {
            return mcfile.src(file.id);
        };

        if (isImage($scope.item.mediatype)) {
            $scope.fileType = "image";
        } else if ($scope.item.mediatype === "application/pdf") {
            $scope.fileType = "pdf";
        } else {
            $scope.fileType = $scope.item.mediatype;
        }
    }
}(angular.directive('materialscommons')));
