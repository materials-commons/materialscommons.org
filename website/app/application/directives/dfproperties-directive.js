Application.Directives.directive('dfProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                defaultProperties: '='
            },
            template: "<span ng-repeat='df in defaultProperties'>" +
                "<div class='control-group'>" +
                "<label class='control-label'>{{df.name}}:</label>" +
                "<div class='controls'>" +
                "<p ng-if='df.value_choice.length!=0'>" +
                "<select ng-model='df.value'>" +
                "<option ng-repeat='each in df.value_choice'> {{each}} </option></select>" +
                "</p>" +
                "<p ng-if='df.value_choice.length==0'>" +
                "<input ng-model='df.value' placeholder='{{df.name}}...' type='text'>" +
                "</p>" +
                "</div>" +
                "</div>" +
                "</span>"
        };
    });
