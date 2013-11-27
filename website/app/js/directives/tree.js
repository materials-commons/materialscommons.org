/*
** Based on the Angular Treeview code written by: Kavitha Kgowd. You can find it at:
** http://logically-thinking.blogspot.in/2013/07/angular-treeview-directive-01v.html.
** Code was modified to meet additional requirements for example calling out to an
** external selected function.
*/



angular.module("NgTree.tpls", ["template/ngtree/tree.html", "template/ngtree/element.html"]);

angular.module("NgTree", ["NgTree.tpls", "template/ngtree/tree.html"])
    .factory('treeToggle', function () {
        var selected = [];
        var checked_items = [];
        return {
            add_id: function (id) {
                selected.push(id);
            },

            pop_id: function (id) {
                return  selected.splice(selected.indexOf(id), 1);
            },

            get_all: function(){
                return selected
            },

            get_all_checked_items: function(){
                return checked_items
            },

            add_checked_item: function(id){
                checked_items.push(id)
            },

            pop_checked_item: function(id){
                checked_items.splice(checked_items.indexOf(id), 1);
            }
        }
    })
    .controller("NgTreeController", ["$scope", "$attrs", "treeToggle",
        function ($scope, $attrs, treeToggle) {

            /*
             Following 3 functions are to determine if the state of toggle
            */

            $scope.toggleShow = function(d){
                if (treeToggle.get_all().indexOf(d.id)>= 0){ //open
                    $scope.choose = treeToggle.pop_id(d.id);
                }else{      //closed
                    treeToggle.add_id(d.id);
                }
            }

            $scope.getSelectedClass = function (id) {
                return $scope.isSelected(id) ? 'show' : '';
            }

            $scope.isSelected = function (id) {
                return treeToggle.get_all().indexOf(id) >= 0;
            }

            /*
            Following 3 functions are to determine if box is checked or not
            */
            $scope.determine_check = function (id) {
                return treeToggle.get_all_checked_items().indexOf(id) >= 0;
            }

            $scope.check = function (id){
                if (treeToggle.get_all_checked_items().indexOf(id)>= 0){ //open
                    treeToggle.pop_checked_item(id);
                }
                else{
                    treeToggle.add_checked_item(id);
                }
            }
            $scope.isChecked = function (id) {

                return $scope.determine_check(id) ? 'show' : '';
            }

        }])
    .directive("ngtree", function (treeToggle) {
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
    var template =
        '<ul style="padding:0px; margin:0px;">' +
        '<li ng-repeat="data in treeData|filter:searchModel  " ng-include="\'template/ngtree/element.html\'"></li>' +

        '</ul>'
    $templateCache.put("template/ngtree/tree.html", template);
}]);

angular.module("template/ngtree/element.html", []).run(["$templateCache", function ($templateCache) {
    var template =
        "<div class='list-item'>" +
        "  <div ng-show='data.children' ng-class='{show: !getSelectedClass(data.id), hide: getSelectedClass(data.id)}' class='pull-left' ng-click='toggleShow(data)'>" +
        "    <img src='rightarrowtree.png' width='16px' height='16px' style='max-width: 16px'/>" +
        "  </div>" +
        "  <div ng-show='data.children' ng-class='{show: getSelectedClass(data.id), hide: !getSelectedClass(data.id)}' class='pull-left' ng-click='toggleShow(data)'>" +
        "    <img src='downarrow.png' width='16px' height='16px' style='max-width: 16px'/>" +
        "  </div>" +
        "  <div ng-show='!data.children' ng-class='{show: !getSelectedClass(data.id), hide: getSelectedClass(data.id)}' class='pull-left'></div>" +
        "  <div class='item' style='padding-left: 0px'>" +
        "      <span type=\"checkbox\" style=\"margin-bottom: 7px;\"    ng-click=\"check(data.id)\" class=\"treecheckBox\">" +
        "        <img src=\"checkmark.png\"  ng-class='{show: isChecked(data.id), hide: !isChecked(data.id)}'  class=\"checkBox-icon\"/>" +
        "      </span>" +
        "      <span ng-click=\"selected({d: data})\" style='cursor:pointer'>{{data[displayAttr]}}</span>" +
        "  </div>" +
        "</div>" +
        "<ul ng-class='{display:!getSelectedClass(data.id), displayshow:getSelectedClass(data.id)}' style='padding-left: 20px'>" +
        "   <li ng-repeat='data in data.children|filter:searchModel' ng-include='\"template/ngtree/element.html\"' style='padding-left: 0px;'></li>" +
        "</ul>"
        ;
    $templateCache.put("template/ngtree/element.html", template);
}]);