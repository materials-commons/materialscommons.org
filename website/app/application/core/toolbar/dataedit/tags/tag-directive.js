Application.Directives.directive('selectTag',
    function () {
        return {
            restrict: "A",
            scope: {
                tagChoices: '='
            },
            template: "<form class='form-horizontal'>" +
                "<input ui-keypress='{13: 'addTagKeypressCallback($event)'}' ng-model='new_tag' placeholder='Tag...'>" +
                "<label>Tags to add</label>" +
                "<select ng-model='tag_to_add' ui-select2='{placeholder: 'Select tag', allowClear: true, width:'element'}'" +
                "ng-multiple='false'>"  +
                    "<option></option>" +
                    "<option ng-repeat='tag in tagchoices'>{{ tag }}</option> " +
                "</select>" +
                "<button ng-click='addTag()' class='btn btn-default btn-info'>Add</button>"
        };
    });
