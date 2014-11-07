Application.Directives.directive("customPopOver", ["$compile",
    function ($compile) {
        var itemsTemplate = "<ul class='unstyled'><li ng-repeat='item in items'>{{item.item_type}}: {{item.item_name}}</li></ul>";
        var processesTemplate = "<ul class='unstyled'><li ng-repeat='process in processes'>{{process.name}}</li></ul>";
        function getTemplate(contentType) {
            var template = '';
            switch (contentType) {
                case 'items':
                    template = itemsTemplate;
                    break;
                case 'processes':
                    template = processesTemplate;
                    break;
            }
            return template;
        }

        return {
            restrict: "A",
            transclude: true,
            template: "<span ng-transclude></span>",
            link: function (scope, element, attrs) {
                var popOverContent, html, options = {};
                if (scope.items) {
                    html = getTemplate("items");
                    popOverContent = $compile(html)(scope);
                    options = {
                        content: popOverContent,
                        placement: "left",
                        html: true,
                        title: scope.title
                    };
                }else{
                    html = getTemplate("processes");
                    popOverContent = $compile(html)(scope);
                    options = {
                        content: popOverContent,
                        placement: "left",
                        html: true,
                        title: scope.title
                    };
                }

                $(element).popover(options);
            },
            scope: {
                items: '=',
                title: '=' ,
                processes: '='
            }
        };
    }]);
