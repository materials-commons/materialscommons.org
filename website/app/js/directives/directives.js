
var materialsdirective = angular.module("materialsdirective", []);

materialsdirective.directive('wordcloud', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: { list: '=wordcloud' },

        link: function (scope, element) {
            scope.$watch('list', function (list) {
                if (list) {
                    $(element).jQCloud(list, {});
                }
            });

        }
    };
});

materialsdirective.directive('datepicker', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.datepicker();
            element.bind('changeDate', function () {
                scope.$apply(function () {
                    scope[attrs.ngModel] = element.val()
                });
            })
        }
    };
});

materialsdirective.directive('raphael', function ($compile) {

      return {
          restrict: 'EA',
          scope: { ProcessList: '=processList' },
          link: function(scope, element, attrs){
              var paper = Raphael(element[0], 1000, 1000);
              var connections = [];
              var shapes = new Array();
              var texts = new Array();
              var x = 20, y = 20;
              var width = 80 , height = 40 , radius = 5;

              for (var i = 0; i< scope.ProcessList.length; i++){
                  shapes[i] = paper.rect(x,y,width, height,radius);
                  texts[i] =  paper.text(x+50,y+20,scope.ProcessList[i].name + ' - ' + i );
                  shapes[i].attr({fill: 'yellow', stroke: '#000080', "stroke-width": 2, cursor: "move"});
                  texts[i].attr({fill: '#0000A0', stroke: "none", "font-size": 12,"font-weight":"bold", cursor: "move"});
                  var c = ["M", x+width, height, "L", x+180, height].join(",");

                  if (i == 4){
                  }
                  else{
                      connections.push(paper.path(c))
                      x = x+180;
                      y = y+0;
                  }
              }
              $compile(element.contents())(scope);


          }
      }

});

materialsdirective.directive('bs:popover', function (expression, compiledElement) {
    return function (linkElement) {
        linkElement.popover();
    };
});


materialsdirective.directive('notification', function($timeout){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div class="alert fade" bs-alert="ngModel"></div>',
        link: function(scope, element){
            scope.$watch('ngModel', function(){
                element.show();
                $timeout(function(){
                    element.hide();
                }, 3000);
            });
        }
    }
});

materialsdirective.directive('paged', function() {
    return {
        template: '<div>' +
            '<div ng-transclude=""></div>' +
            '<div ng-show="data.length > pageSize">' +
            '<button ng-disabled="!hasPreviousPage()" ng-click="previousPage()"> Previous </button>' +
            '{{showStart()}} - {{end()}} out of {{size()}}' +
            '<button ng-disabled="!hasNextPage()" ng-click="nextPage()"> Next </button>' +
            '</div>' +
            '</div>',
        restrict: 'E',
        transclude:true,
        scope: {
            'currentPage' : '=',
            'pageSize': '=',
            'data': '='
        },
        link: function($scope, element, attrs) {
            $scope.size = function() {
                return $scope.data.length;
            }

            $scope.end = function() {
                var endItem = $scope.start() + $scope.pageSize;
                return endItem > $scope.size() ? $scope.data.length : endItem;
            }

            $scope.start = function() {
                return $scope.currentPage * $scope.pageSize;
            }

            $scope.showStart = function() {
                var s = $scope.start();
                return s+1;
            }

            $scope.page = function() {
                return $scope.size() ? ($scope.currentPage + 1) : 0;
            }

            $scope.hasNextPage = function() {
                return $scope.page() < ($scope.size() / $scope.pageSize);
            }

            $scope.nextPage = function() {
                $scope.currentPage = parseInt($scope.currentPage) + 1;
            }

            $scope.hasPreviousPage = function() {
                return $scope.currentPage != 0;
            }

            $scope.previousPage = function() {
                $scope.currentPage = $scope.currentPage - 1;
            }

            try {
                if (!angular.isDefined($scope.data)) {
                    $scope.data = [];
                }

                if (!angular.isDefined($scope.currentPage)) {
                    $scope.currentPage = 0;
                }

                if (!angular.isDefined($scope.pageSize)) {
                    $scope.pageSize = 10;
                }
            } catch(e) {}
        }
    }
});



