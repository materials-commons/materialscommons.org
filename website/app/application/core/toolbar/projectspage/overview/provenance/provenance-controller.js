Application.Controllers.controller('toolbarProjectsPageOverviewProvenance',
    ["$scope", "$stateParams", function ($scope, $stateParams) {


        function init() {
            $scope.project_id = $stateParams.id;
            $scope.tree_data = [
                {Name:"Sample1",Processes:"p1, p2",
                    children:[
                        {Name:"Sample1.1", Processes:"p3", id: '',
                            children:[
                                {Name:"Sample1.1.1", id: ''},
                                {Name:"Sample1.1.2", Processes:"p8", id: ''}
                            ]
                        },
                        {Name:"Sample1.2", Processes:1,id: '',
                            children:[
                                {Name:"Sample1.2.1", Processes:"p3",id: ''}
                            ]
                        }
                    ]
                },
                {Name:"Sample2",Processes:"p9"}
            ];
            $scope.col_defs = [
                { field: "Processes"}
            ];


        }

        init();
    }]);