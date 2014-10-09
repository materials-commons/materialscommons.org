Application.Directives.directive("actionLink", actionLinkDirective);

function actionLinkDirective() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            onClick: '&ngClick',
            title: "@",
            titleIcon: "@" ,
            link: "@"
        },
        template: '<a class="action-link project-sub-action" ng-click="onClick()">' +
            '<i class="fa {{titleIcon}}"></i>' +
            '<span style="color: #ffffff" ng-show="link"><u>{{title}}</u></span>' +
            '<span  style="color: #ffffff" ng-hide="link">{{title}}</span>'
    };
}
