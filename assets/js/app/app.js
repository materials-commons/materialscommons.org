angular.module('materialscommons', ['CornerCouch', 'ui']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/materialscommons',
            {templateUrl:'partials/front-page.html', controller:FrontPageController}).
        when('/materialscommons/data',
            {templateUrl:'partials/data/data.html', controller:DataSearchController}).
        when('/materialscommons/models',
            {templateUrl: 'partials/models/models.html', controller: ModelsSearchController}).
        when('/materialscommons/notebook',
            {templateUrl: 'partials/notebook/experiment-list.html', controller: ExperimentListController}).
        when('/materialscommons/notebook/create',
            {templateUrl: 'partials/notebook/experiment.html', controller: ExperimentCreateController}).
        when('/materialscommons/experiment/:experimentId',
            {templateUrl:'partials/notebook/experiment.html', controller: ExperimentDetailController}).
        otherwise({redirectTo:'/materialscommons'});
//            when('/experiments', {templateUrl: 'partials/does-not-exists.html', controller: ExperimentListController}).
//            when('/experiments/:experimentId', {templateUrl: 'partials/experiment-detail.html',
//                controller: ExperimentDetailController}).
}
]);
