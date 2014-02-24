Application.Controllers.controller('toolbarOverview',
    ["$scope",
        function ($scope) {
            $scope.init = function () {
                $scope.projects = [
                    {
                        name: "Test_Proj",
                        id: "c33edab7-a65f-478e-9fa6-9013271c73ea",
                        directories: 30,
                        files: 100,
                        birthtime: "11/12/2013",
                        description: "An interesting project",
                        size: "10Gb",
                        drafts: 5,
                        reviews: 0,
                        todos: [
                            {name: "a", description: "Do something"}
                        ],
                        provenance: 3
                    },
                    {
                        name: "WE43 Heat Treatments",
                        id: "904886a7-ea57-4de7-8125-6e18c9736fd0",
                        directories: 30,
                        files: 100,
                        size: "10Gb",
                        birthtime: "11/12/2013",
                        description: "An interesting project",
                        drafts: 5,
                        reviews: 0,
                        todos: [
                            {name: "a", description: "Do something"}
                        ],
                        provenance: 3
                    }
                ];
            };

            $scope.init();
        }]);