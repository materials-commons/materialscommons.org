Application.Directives.directive("customPopOver", ["$compile",
    function ($compile) {
        var itemsTemplate = "<label>1</label>one <label>2</label>two";
        console.log(itemsTemplate)
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
                console.log(scope.title);
                console.log(scope.items);

                var options = {
                    content: popOverContent,
                    placement: "bottom",
                    html: true,
                    title: scope.title
                };
                $(element).popover(options);
            },
            scope: {
                items: '=',
                title: '@'
            }
        };
    }]);
