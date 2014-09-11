Application.Controllers.controller('ProjectTreeController',
                                   ["$scope", "mcapi", "projectFiles", "pubsub", "ProjectPath",
                                    "$state", "Tags", "User", "dateGenerate", "$filter", "model.projects","actionStackTracker",  ProjectTreeController]);

function ProjectTreeController ($scope, mcapi, projectFiles, pubsub, ProjectPath, $state, Tags, User, dateGenerate, $filter, projects, actionStackTracker) {

    $scope.addToReview = function(entry, review){
        review.items.push({'id': entry.id, 'path': entry.fullname, 'name': entry.name, 'type': entry.type});
        mcapi('/reviews/%', review.id)
            .success(function (data) {
                pubsub.send('open_reviews.change');
            }).put({'items': review.items});
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
            }).post(item2tag);
        //Sticking tag in the tree
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

    $scope.init = function() {
        $scope.isActionActive = actionStackTracker.actionActive;
        $scope.user = User.u();
        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };

        $scope.isActionActive = actionStackTracker.actionActive;
        $scope.user_tags = User.attr().preferences.tags;
//        $scope.user_tags = Tags.getUserTags();
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
