Application.Directives.directive('mcTree', mcTreeDirective);

function mcTreeDirective() {
    return {
        restrict: "E",
        scope: {
            items: '=items',
            orderby: '=orderby',
            matches: '=matches',
            bk: '=bk'
        },
        replace: true,
        templateUrl: 'application/directives/mc-tree.html'
    };
}

Application.Directives.directive('mcTreeHeader', [mcTreeHeaderDirective]);

function mcTreeHeaderDirective() {
    return {
        restrict: "E",
        scope: {
            item: '=item',
            showSideboard: "=showSideboard"
        },
        controller: "mcTreeHeaderDirectiveController",
        replace: true,
        templateUrl: 'application/directives/mc-tree-header.html'
    };
}

Application.Directives.directive('mcTreeDir', ["RecursionHelper", mcTreeDirDirective]);

function mcTreeDirDirective(RecursionHelper) {
    return {
        restrict: "E",
        scope: {
            item: '=item'
        },
        controller: "mcTreeDirDirectiveController",
        replace: true,
        templateUrl: 'application/directives/mc-tree-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn) {
            });
        }
    };
}

Application.Controllers.controller("mcTreeDirDirectiveController",
                                   ["$scope", mcTreeDirDirectiveController]);
function mcTreeDirDirectiveController($scope) {
    $scope.items = $scope.item.children;
}


Application.Controllers.controller("mcTreeHeaderDirectiveController",
                                   ["$scope", "mcfile", "sideboard", "current", "toggleDragButton", "pubsub", "mcapi",
                                    mcTreeHeaderDirectiveController]);
function mcTreeHeaderDirectiveController($scope, mcfile, sideboard, current, toggleDragButton, pubsub, mcapi) {
    if ($scope.item.type === "datadir") {
        $scope.tooltip = "Upload to directory";
        $scope.faClass = "fa-upload";
    } else {
        $scope.tooltip = "Download file";
        $scope.faClass = "fa-download";
    }

    $scope.downloadSrc = function(file) {
        return mcfile.downloadSrc(file.id);
    };

    $scope.addToSideboard = function(file, event) {
        sideboard.handleFromEvent(current.projectID(), file, event, 'sideboard');
    };

    $scope.newFolder = function(currentDir, name) {
        mcapi('/datadirs')
            .success(function(datadir){
                currentDir.addFolder = false;
                currentDir.children.push(datadir);
            })
            .post({
                project_id: current.projectID(),
                parent: currentDir.id,
                name: currentDir.name + "/" + name,
                level: currentDir.level+1
            });
    };

    $scope.isActive = function(type, button){
        return toggleDragButton.get(type, button);
    };

    $scope.addItem = function (type, file) {
        switch (type) {
        case "review":
            pubsub.send('addFileToReview', file);
            break;
        case "sample":
            pubsub.send('addFileToSample', file);
            break;
        case "provenance":
            pubsub.send('addFileToProvenance', file);
            break;
        case "file":
            pubsub.send('addFileToNote', file);
            break;
        }
    };
}

Application.Directives.directive("mcTreeDisplayItem", mcTreeDisplayItemDirective);
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

Application.Directives.directive('mcTreeLeaf', mcTreeLeafDirective);

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

Application.Controllers.controller("mcTreeLeafDirectiveController",
                                   ["$scope", "User", "mcfile",
                                    mcTreeLeafDirectiveController]);
function mcTreeLeafDirectiveController($scope, User, mcfile) {
    console.dir($scope.item);
    $scope.apikey = User.apikey();

    $scope.fileSrc = function(file) {
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
