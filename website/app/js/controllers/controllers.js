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

function ProvenanceController($scope, $rootScope) {
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

function SubPageController($scope, $routeParams) {
    $scope.template = "partials/data/data-main.html";
    if ($routeParams.tab) {
        switch ($routeParams.tab) {
            case "data-tab":
                $scope.template = "partials/data/data-subpage.html";
                $('#my-data-tab').addClass("active");
                break;

            case "tags-tab":
                $scope.template = "partials/tags/tags-subpage.html";
                $('#tags-tab').addClass("active");
                break;
            case "conditions-tab":
                $scope.template = "partials/conditions/conditions-subpage.html";
                $('#conditions-tab').addClass("active");
                break;

            case "provenance-tab":
                $scope.template = "partials/provenance/provenance-subpage.html";
                $('#provenance-tab').addClass("active");
                break;
            case "upload-tab":
                $scope.template = "partials/updownload/upload-subpage.html";
                $('#upload-tab').addClass("active");
                break;

            case "reviews-tab":
                $scope.template = "partials/reviews/review-subpage.html";
                $('#reviews-tab').addClass("active");
                break;

            case "usergroups-tab":
                $scope.template = "partials/usergroups/usergroup-subpage.html";
                $('#usergroups-tab').addClass("active");
                break;


            case "my-projects-tab":
                $scope.template = "partials/datagroups/my_data_groups.html";
                $('#my-data-tab').addClass("active");
                break;

            case "my-data-tab":
                $scope.template = "partials/data/my-data.html";
                $('#my-data-tab').addClass("active");
                break;

            case "my-projects-tree-tab":
                $scope.template = "partials/datagroups/tree.html";
                $('#my-data-tab').addClass("active");
                break;
            case "group-projects-tree-tab":
                $scope.template = "partials/datagroups/group-tree.html";
                $('#my-data-tab').addClass("active");
                break;

            case "thumbnail-tab":
                $scope.template = "partials/thumbnail.html";
                $('#my-data-tab').addClass("active");
                break;

            case "list-tags-tab":
                $scope.template = "partials/tags/tags-list.html";
                $('#tags-tab').addClass("active");
                break;

            case "my-tags-list-tab":
                $scope.template = "partials/tags/my-tags-list.html";
                $('#tags-tab').addClass("active");
                break;

            case "global-tag-cloud-tab":
                $scope.template = "partials/tags/tagcloud.html";
                $('#tags-tab').addClass("active");
                break;

            case "create-template-tab":
                $scope.template = "partials/conditions/create-template.html";
                $('#conditions-tab').addClass("active");
                break;

            case "list-template-tab":
                $scope.template = "partials/conditions/list-condition-template.html";
                $('#conditions-tab').addClass("active");
                break;

            case "track-tab":
                $scope.template = "partials/provenance/provenance.html";
                $('#provenance-tab').addClass("active");
                break;

            case "review-list-tab":
                $scope.template = "partials/reviews/review-list.html";
                $('#reviews-tab').addClass("active");
                break;

            case "create-usergroup-tab":
                $scope.template = "partials/usergroups/usergroup-create.html";
                $('#usergroups-tab').addClass("active");
                break;

            case "my-usergoups-tab":
                $scope.template = "partials/usergroups/my_usergroups.html";
                $('#usergroups-tab').addClass("active");
                break;

            case "all-usergoups-tab":
                $scope.template = "partials/usergroups/usergroups_list_all.html";
                $('#usergroups-tab').addClass("active");
                break;

            case "upload-file-tab":
                $scope.template = "partials/updownload/upload-file.html";
                $('#upload-tab').addClass("active");
                break;

            case "upload-directory-tab":
                $scope.template = "partials/updownload/upload-directory.html";
                $('#upload-tab').addClass("active");
                break;

            case "updownload-queue-tab":
                $scope.template = "partials/updownload/udqueue.html";
                $('#upload-tab').addClass("active");
                break;

            case "projects-view-tab":
                $scope.template = "partials/project/project-report.html";
                $('#upload-tab').addClass("active");
                break;
        }
    }
}



