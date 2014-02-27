Application.Directives.directive('dfProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                defaultProperties: '='
            },
            template:
                "<div class='control-group' ng-repeat='df in defaultProperties'>" +
                "<label class='control-label'>{{df.name}}:</label>" +
                "<div class='controls'>" +
                "<div ng-if='df.value_choice.length!=0'>" +
                "<select ng-model='df.value'>" +
                "<option ng-repeat='each in df.value_choice'> {{each}} </option></select>" +
                "</div>" +
                "<div ng-if='df.value_choice.length==0'>" +
                "<input ng-model='df.value' placeholder='{{df.name}}...' type='text'>" +
                "</div>" +
                "<div ng-if='df.unit_choice.length!=0'>" +
                "<select ng-model='df.unit'>" +
                "<option ng-repeat='each in df.unit_choice'> {{each}} </option></select>" +
                "</div>" +
                "</div>" +
                "</div>"

        };
    });
