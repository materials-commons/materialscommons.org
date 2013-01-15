/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:10 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('materialscommons', ['CornerCouch']).
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
            {templateUrl: 'partials/notebook/create-experiment.html', controller: ExperimentCreateController}).
        otherwise({redirectTo:'/materialscommons'});
//            when('/experiments', {templateUrl: 'partials/does-not-exists.html', controller: ExperimentListController}).
//            when('/experiments/:experimentId', {templateUrl: 'partials/experiment-detail.html',
//                controller: ExperimentDetailController}).
}
]);
