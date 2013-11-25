'use strict';


function FrontPageController($scope, $location) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function () {
        $location.path("/searchindex/search_key/" + $scope.keyword);
    }
}

function HomeController($scope, mcapi) {
    mcapi('/news')
        .success(function (data) {
            $scope.news = data;
        }).jsonp();
}

function ExploreController($scope) {
    $scope.pageDescription = "Explore";
}

function AboutController($scope) {
    $scope.pageDescription = "About";


}

function ContactController($scope) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope) {
    $scope.pageDescription = "Help";


}


function EventController($scope, alertService) {
    $scope.message = '';
    $scope.$on('handleBroadcast', function () {
        $scope.message = {"type": "info",
            "content": alertService.message};
    });

}

function ProvenanceController($scope) {
    $scope.process = [
        {
            name: 'TEM',
            owner: 'Allison',
            inputs: ['TEM-excel-analysis', 'TEM conditions.txt'],
            outputs: ['image-display.jpg', 'TEM-analysis.xls', 'TEM.jpg']
        },
        {
            name: 'pr22',
            owner: 'Emanuelle',
            inputs: ['TEM-analysis.xls', 'a.txt'],
            outputs: ['pr22-excel-analysis', 'a.txt', 'pr22.jpg']
        },
        {
            name: 'SEM',
            owner: 'Emanuelle',
            inputs: ['SEM-excel-analysis', 'a.txt', 'pr22.jpg'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg', 'file1.txt']
        },
        {
            name: 'P4',
            owner: 'Allison',
            inputs: ['file1.txt', 'file2.txt', 'file4.txt'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg']
        },
        {
            name: 'P5',
            owner: 'Emanuelle',
            inputs: ['p5-excel-analysis', 'a.txt', 'p5.jpg'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg']
        }
    ];
    $scope.get_process_details = function (index) {
        $scope.$apply(function () {
            $scope.details = $scope.process[index];

        })
    }

}

