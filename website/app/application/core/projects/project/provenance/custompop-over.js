Application.Directives.directive("customPopOver", ["$compile",
    function ($compile) {
        var itemsTemplate = "<ul class='unstyled'><li ng-repeat='item in items'>{{item}}</li></ul>"
        var getTemplate = function (contentType) {
            var template = '';
            switch (contentType) {
                case 'items':
                    template = itemsTemplate;
                    break;
            }
            return template;
        }

        return {
            restrict: "A",
            transclude: true,
            template: "<span ng-transclude></span>",
            link: function (scope, element, attrs) {
                var popOverContent;
                if (scope.items) {
                    var html = getTemplate("items");
                    popOverContent = $compile(html)(scope);
                }
                var options = {
                    content: popOverContent,
                    placement: "left",
                    html: true,
                    title: scope.title
                };
                $(element).popover(options);
            },
            scope: {
                items: '=',
                title: '='
            }
        };
    }]);
