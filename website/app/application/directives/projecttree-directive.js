Application.Controllers.controller('ProjectTreeController',
                                   ["toastr","$scope", "mcapi", "projectFiles", "pubsub", "ProjectPath",
                                    "$state", "Tags", "User", "dateGenerate", "$filter", "model.projects","actionStatus", "provStep", ProjectTreeController]);

function ProjectTreeController (toastr, $scope, mcapi, projectFiles, pubsub, ProjectPath, $state, Tags, User, dateGenerate, $filter, projects, actionStatus, provStep) {

    $scope.addToReview = function(entry, review){
        var item = {'id': entry.id, 'path': entry.fullname, 'name': entry.name, 'type': entry.type};
        var index = _.indexOf(review.items, function (each_review) {
            return each_review.id === item.id;
        });

        if (index == -1){
            review.items.push(item);
            mcapi('/reviews/%', review.id)
                .success(function (data) {
                    pubsub.send('update-items.change');
                }).put({'items': review.items});
        }
    };

    pubsub.waitOn($scope, "project.tree", function (treeVisible) {
        $scope.treeActive = treeVisible;
    });

    pubsub.waitOn($scope, "tags.change", function () {
        $scope.user_tags  = Tags.getUserTags();
    });


    $scope.openFolder = function (item) {
        var e = _.find($scope.trail, function (trailItem) {
            return trailItem.id === item.id;
        });
        if (typeof e === 'undefined') {
            // first level is 0 so we need to add 1 to our test
            if (item.level + 1 <= $scope.trail.length) {
                // Remove everything at this level and above
                $scope.trail = $scope.trail.splice(0, item.level);
            }
            $scope.trail.push(item);
        }
        $scope.dir = item.children;
        ProjectPath.update_dir(item);
        $scope.loaded = true;
    };

    $scope.backToFolder = function (item) {
        $scope.dir = ProjectPath.update_dir(item);
        var i = _.indexOf($scope.trail, function (each_trail) {
            return (item.id === each_trail.id);
        });
        if(i!= -1){
            $scope.trail = $scope.trail.splice(0, i + 1);
        }
    };

    $scope.populatePath = function (entry) {
        ProjectPath.populate($scope.trail, $scope.dir);
        // $state.go("projects.dataedit.details", {data_id: entry.id});
        $scope.toggleStackAction('file', entry.name, entry.id, entry.id);
    };

    $scope.loadReviews = function (id) {
        mcapi('/project/%/reviews', id)
            .success(function (reviews) {
                $scope.open_reviews = $filter('reviewFilter')(reviews, 'open');
            }).jsonp();

    };

    $scope.selectProject = function (projectId) {
        $scope.trail = [];
        $scope.projectId = projectId;
        $scope.tree_data = [];
        $scope.loaded = false;
        if (!(projectId in $scope.model.projects)) {
            mcapi('/projects/%/tree2', projectId)
                .success(function (data) {
                    if (data[0]) {
                        $scope.tree_data = data;
                        $scope.dir = $scope.tree_data[0].children;
                        ProjectPath.update_dir($scope.tree_data[0]);
                        var obj = {};
                        obj.dir = $scope.tree_data[0];
                        $scope.model.projects[projectId] = obj;
                        $scope.loaded = true;
                        $scope.trail.push(data[0]);
                    }
                }).jsonp();
        } else {
            $scope.loaded = true;
            $scope.dir = $scope.model.projects[projectId].dir.children;
            ProjectPath.update_dir($scope.model.projects[projectId]);
            $scope.trail.push($scope.model.projects[projectId].dir);
        }
    };

    $scope.fileSelected = function (entry) {
            entry.selected = !entry.selected;
            var channel = projectFiles.channel;
            if (channel !== null) {
                pubsub.send(channel, entry);
            }

    };

    $scope.truncateTrail = function (currentTrail, currentItem) {
        var i = _.indexOf(currentTrail, function(item) {
            return item.displayname == currentItem.displayname;
        });

        return currentTrail.slice(0, i+1);
    };

    $scope.addTag = function(entry, selected_tag){
        //Filling tag join table
        var item2tag = {};
        item2tag.item_id = entry.id;
        item2tag.item_name = entry.name;
        item2tag.item_type = entry.type;
        item2tag.user = User.u();
        item2tag.tag =  selected_tag;
        if (entry.type === 'datafile'){
            item2tag.fullname = entry.fullname;
        }
        mcapi('/item/tag/new')
            .success(function (data) {
                var i;
                i = _.indexOf($scope.dir, function (item) {
                    return item.id === entry.id;
                });
                if(i != -1){
                    if ((Object.keys($scope.dir[i]['tags'])).indexOf($scope.user) === 0){
                        $scope.dir[i]['tags'][$scope.user].push(selected_tag);
                    }
                    else{
                        $scope.dir[i]['tags'][$scope.user] = [selected_tag];
                    }
                }
            }).error(function(e){
                toastr.error(e.error, 'Error', {
                    closeButton: true
                });
            }) .post(item2tag);
    };

    $scope.addReview = function () {
        if ($scope.model.new_review === "" || $scope.model.title === "" || $scope.model.assigned_to === "") {
            return;
        }
        $scope.review = {messages: []};
        $scope.review.items = [{'item_id': $scope.dfitem.id, 'item_type': $scope.dfitem.type, 'item_name': $scope.dfitem.name}];
        $scope.review.project = $scope.project;
        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        $scope.review.messages.push({'message': $scope.model.new_review, 'who': User.u(), 'date': dateGenerate.new_date()});
        $scope.saveData();
    };

    $scope.saveData = function () {
        mcapi('/reviews')
            .success(function (data) {
                $scope.model.new_review = "";
            }).post($scope.review);
    };

    function isReviewActionCurrent() {
        return actionStatus.isCurrentAction($scope.projectID, 'create-review');
    }

    function isProvenanceFileActive() {
        if (actionStatus.isCurrentAction($scope.projectID, 'create-provenance-new') ||
           actionStatus.isCurrentAction($scope.projectID, 'create-provenance-from-draft')) {
            var step = provStep.getCurrentStep($scope.projectID);
            if (step.step == "files") {
                return true;
            }
        }
        return false;
    }

    $scope.showFileCheckbox = function() {
        if (isReviewActionCurrent()) {
            return true;
        } else if (isProvenanceFileActive()) {
            return true;
        }

        return false;
    };

    $scope.init = function() {
        $scope.user = User.u();
        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };

        $scope.user_tags = User.attr().preferences.tags;
        if ($scope.from == 'true') {
            $scope.project = ProjectPath.get_project();
            var currentTrail = ProjectPath.get_trail();
            var item = ProjectPath.get_current_item();
            $scope.trail = $scope.truncateTrail(currentTrail, item);
            $scope.openFolder(item);
        } else {
            $scope.model = projectFiles.model;
            ProjectPath.set_project($scope.project);
            $scope.selectProject($scope.project);
        }

        projects.get($scope.project).then(function(p) {
            var totalFiles = 0;
            var key;
            $scope.projectID = p.id;
            $scope.users = p.users;
            $scope.projectSize = bytesToSizeStr(p.size);
            for (key in p.mediatypes) {
                totalFiles += p.mediatypes[key];
            }
            $scope.fileCount = numberWithCommas(totalFiles);
        });

        $scope.loadReviews($scope.project);
    };

    $scope.init();
}

Application.Directives.directive('projectTree', projectTreeDirective);

function projectTreeDirective () {
    return {
        restrict: "E",
        controller: "ProjectTreeController",
        transclude: false,
        replace: true,
        scope: {
            ngModel: "@",
            project: "@project",
            from: "@from",
            color: "@color",
            treeOverview: "=",
            checkBox: "="
        },
        link: function (scope, element, attrs) {
            scope.$watch('project', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    scope.init();

                }
            }, true);

        },
        templateUrl: "application/directives/projecttree.html"
    };
}
