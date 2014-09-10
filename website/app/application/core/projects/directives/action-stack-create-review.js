Application.Directives.directive('actionCreateReview', actionCreateReviewDirective);

function actionCreateReviewDirective() {
    return {
        scope: {},
        controller: "actionCreateReviewController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-create-review.html"
    };
}

Application.Controllers.controller('actionCreateReviewController',
    ["$scope", "mcapi", "dateGenerate", "User","pubsub","$stateParams","model.projects", "Projects","toaster",  actionCreateReviewController]);

function actionCreateReviewController($scope, mcapi, dateGenerate, User, pubsub,$stateParams, ListProjects, Projects, toaster) {


    $scope.addReview = function () {
        $scope.review = {'items': [], 'messages': []};
        if($scope.model.title == '' || $scope.model.assigned_to == ''){
            toaster.pop('warning', "Review", "Fields: 1) Title: 2)Assign To: are required", 5000);

        }else{
            //pluck the file items
            $scope.model.files.forEach(function(f){
                $scope.review.items.push({'id': f.id, 'path': f.fullname, 'name': f.name, 'type': f.type})
            })
            $scope.review.author = User.u();
            $scope.review.assigned_to = $scope.model.assigned_to;
            $scope.review.status = 'open';
            $scope.review.title = $scope.model.title;
            $scope.review.messages.push({'message': $scope.model.comment, 'who': User.u(), 'date': dateGenerate.new_date()});
            $scope.review.project = $scope.project_id
            $scope.saveData();
        }

    };
    $scope.saveData = function () {
        mcapi('/reviews')
            .success(function (data) {
                toaster.pop('success', "Review", "Review has been successfully added to the list", 3000);
                $scope.model = {
                    comment: "",
                    assigned_to: "",
                    title: "",
                    files: []
                };
                $scope.review = {};
                pubsub.send('open_reviews.change');
                pubsub.send('reviews.change');
            }).post($scope.review);
    };

    $scope.removeFile = function (index) {
        $scope.model.files[index].selected = false;
        $scope.model.files.splice(index, 1);
    };

    $scope.indexOfFile = function (id) {
        for (var i = 0; i < $scope.model.files.length; i++) {
            if ($scope.model.files[i].id == id) {
                return i;
            }
        }
        return -1;
    };
    function init() {
        $scope.channel = 'action-reviews'
        Projects.setChannel($scope.channel);
        ListProjects.getList().then(function (data) {
            $scope.projects = data;
        });
        $scope.project_id = $stateParams.id;
        ListProjects.get($stateParams.id).then(function(project) {
            $scope.project = project;
        });
        $scope.model = {
            comment: "",
            assigned_to: "",
            title: "",
            files: []
        };
//        mcapi('/selected_users')
//            .success(function (data) {
//                $scope.users = data;
//            }).jsonp();


    }

    init();

    pubsub.waitOn($scope, $scope.channel, function (fileentry) {
        if (fileentry.selected) {
            $scope.model.files.push(fileentry);
        } else {
            var i = $scope.indexOfFile(fileentry.id);
            if (i != -1) {
                $scope.model.files.splice(i, 1);
            }
        }
    });
}
