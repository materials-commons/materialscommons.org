Application.Directives.directive('savedNotification',
    function () {
        return {
            restrict: "A",
            scope: {
                message: '='
            },
            template: '<div ng-show="message" class="span4">' +
                '<div class="alert alert-dismissable alert-info"> ' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button> {{message}}</div> ' +
                '</div> '
        };
    });
