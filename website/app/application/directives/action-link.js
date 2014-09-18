Application.Directives.directive("actionLink", actionLinkDirective);

function actionLinkDirective() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            onClick: '&ngClick',
            title: "@",
            titleIcon: "@"
        },
        template: '<a class="action-link project-sub-action" ng-click="onClick()">' +
            '<i class="fa {{titleIcon}}"></i> {{title}}</a>'
    };
}
