angular.module("NgTree.tpls", ["template/ngtree/tree.html", "template/ngtree/element.html"]);
angular.module("NgTree", ["NgTree.tpls", "template/ngtree/tree.html"])
    .controller("NgTreeController", ["$scope", "$attrs",
        function ($scope, $attrs) {

            var c = [];
            $scope.isChecked = function (d, e) {
                if (d == true) {
                    c.push(e)
                }
            };
            $scope.$parent[$attrs.getSelection] = function () {
                return c
            };

            $scope.toggleShow = function(d) {
                if (d.hide == undefined || d.hide == "") {
                    d.hide = "show";
                }
                else {
                    d.hide = "";
                }
            }

            $scope.check = function (d) {

                if (!d.confirm) {
                    d.confirm = true
                } else {
                    d.confirm = false
                }
            }
        }])
    .directive("ngtree", function () {
        return {
            restrict: "EA",
            controller: "NgTreeController",
            transclude: false,
            replace: true,
            //compile: function (b, a) {},
            scope: {
                treeData: "=treeviewData",
                uniqueId: "@",
                displayAttr: "@",
                checkMode: "@",
                ngModel: "@",
                getSelection: "@",
                searchModel: "=searchModel",
                selected: "&",
                d: '='
            },
//            link: function(scope, element, attrs) {
//
//            },
            templateUrl: "template/ngtree/tree.html"
        }
    });

angular.module("template/ngtree/tree.html", []).run(["$templateCache", function ($templateCache) {
    var template = '<ul style="padding:0px; margin:0px;">' +
        '<li ng-repeat="data in treeData|filter:searchModel  " ng-include="\'template/ngtree/element.html\'"></li>' +
        '</ul>';
    $templateCache.put("template/ngtree/tree.html", template);
}]);

angular.module("template/ngtree/element.html", []).run(["$templateCache", function ($templateCache) {
    var template =
        "<div class='list-item'>" +
        "  <div ng-show='data.children' ng-class='{show :!data.hide, hide:data.hide}' class='pull-left' ng-click='toggleShow(data)'>" +
        "    <img src='rightarrowtree.png' width='16px' height='16px' style='max-width: 16px'/>" +
        "  </div>" +
        "  <div ng-show='data.children' ng-class='{hide:!data.hide, show:data.hide }' class='pull-left' ng-click='toggleShow(data)'>" +
        "    <img src='downarrow.png' width='16px' height='16px' style='max-width: 16px'/>" +
        "  </div>" +
        "  <div ng-show='!data.children' ng-class='{show :!data.hide, hide:data.hide}' class='pull-left'></div>" +
        "  <div class='item' style='padding-left: 0px'>" +
        "      <span type=\"checkbox\" style=\"margin-bottom: 7px;\" ng-class=\"{opacity:data.partial == true}\" ng-click=\"check(data)\" class=\"treecheckBox\">" +
        "        <img src=\"checkmark.png\" ng-show=\"data.confirm\" class=\"checkBox-icon\"/>" +
        "      </span>" +
        "      <span ng-click=\"selected({d: data})\" style='cursor:pointer'>{{data[displayAttr]}}</span>" +
        "  </div>" +
        "</div>" +
        "<ul ng-class='{display:!data.hide, displayshow:data.hide}' style='padding-left: 20px'>" +
        "   <li ng-repeat='data in data.children|filter:searchModel' ng-include='\"template/ngtree/element.html\"' style='padding-left: 0px;'></li>" +
        "</ul>";
    $templateCache.put("template/ngtree/element.html", template);
}]);