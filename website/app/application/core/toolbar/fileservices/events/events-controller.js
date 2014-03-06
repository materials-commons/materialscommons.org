Application.Controllers.controller('toolbarFileServicesEvents',
    ["$scope", function ($scope) {
        $scope.$on('socket:file', function (ev, data) {
            var o, obj;

            if ($scope.events.length >= 100) {
                $scope.events.splice(0, 1);
            }
            if ($scope.filepathLookup[data.filepath] === undefined) {
                obj = {
                    type: 'success',
                    msg: "File changed: " + data.filepath,
                    event: data.event,
                    count: 1
                };
                $scope.filepathLookup[data.filepath] = obj;
                $scope.events.push(obj);
            } else {
                $scope.$apply(function () {
                    o = $scope.filepathLookup[data.filepath];
                    o.event = data.event;
                    o.count = o.count + 1;
                });
            }
        });

        $scope.closeEvent = function (index) {
            var o = $scope.events[index];
            delete $scope.filepathLookup[o.filepath];
            $scope.events.splice(index, 1);
        };

        $scope.init = function () {
            console.log("toolbarFileServicesEvents");
            $scope.events = [];
            $scope.filepathLookup = [];
        };

        $scope.init();
    }]);