/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:11 PM
 * To change this template use File | Settings | File Templates.
 */

var materialsdirective = angular.module("materialsdirective", []);

materialsdirective.directive("jqueryTable", function() {
    return {
        restrict: 'A',
        link: function(scope,element, attrs){
            console.log("directive called");
            $('#myTable').tablesorter();
        }

    };
}) ;


materialsdirective.directive('datepicker', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            element.datepicker();
            element.bind('changeDate', function(){
                scope.$apply(function(){
                    scope[attrs.ngModel] = element.val()
                });
            })


        }
    };
});


materialsdirective.directive('fileChange', function () {
    var linker = function ($scope, element, attributes) {
        // onChange, push the files to $scope.files.
        element.bind('change', function (event) {
            var files = event.target.files;
            $scope.$apply(function () {
                for (var i = 0, length = files.length; i < length; i++) {
                    $scope.files.push(files[i]);
                }
            });
        });
    };

    return {
        restrict: 'A',
        link: linker
    };

});

materialsdirective.directive('upload', function(uploadManager){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).fileupload({
                dataType: 'text',
                add: function (e, data) {
                    uploadManager.add(data);
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    uploadManager.setProgress(progress);
                },
                done: function (e, data) {
                    uploadManager.setProgress(0);
                }
            });
        }
    };
});

materialsdirective.directive('bs:popover', function(expression, compiledElement){
    return function(linkElement) {
        linkElement.popover();
    };
});

materialsdirective.directive('bsPopover', function($parse, $compile, $http, $timeout, $q, $templateCache) {

    // Hide popovers when pressing esc
    $('body').on('keyup', function(ev) {
        if(ev.keyCode === 27) {
            $('.popover.in').each(function() {
                $(this).popover('hide');
            });
        }
    });

    return {
        restrict: 'A',
        scope: true,
        link: function postLink(scope, element, attr, ctrl) {

            var getter = $parse(attr.bsPopover),
                setter = getter.assign,
                value = getter(scope),
                options = {};

            if(angular.isObject(value)) {
                options = value;
            }

            $q.when(options.content || $templateCache.get(value) || $http.get(value, {cache: true})).then(function onSuccess(template) {

                // Handle response from $http promise
                if(angular.isObject(template)) {
                    template = template.data;
                }

                // Handle data-unique attribute
                if(!!attr.unique) {
                    element.on('show', function(ev) { // requires bootstrap 2.3.0+
                        // Hide any active popover except self
                        $('.popover.in').each(function() {
                            var $this = $(this),
                                popover = $this.data('popover');
                            if(popover && !popover.$element.is(element)) {
                                $this.popover('hide');
                            }
                        });
                    });
                }

                // Handle data-hide attribute to toggle visibility
                if(!!attr.hide) {
                    scope.$watch(attr.hide, function(newValue, oldValue) {
                        if(!!newValue) {
                            popover.hide();
                        } else if(newValue !== oldValue) {
                            popover.show();
                        }
                    });
                }

                // Initialize popover
                element.popover(angular.extend({}, options, {
                    content: template,
                    html: true
                }));

                // Bootstrap override to provide tip() reference & compilation
                var popover = element.data('popover');
                popover.hasContent = function() {
                    return this.getTitle() || template; // fix multiple $compile()
                };
                popover.getPosition = function() {
                    var r = $.fn.popover.Constructor.prototype.getPosition.apply(this, arguments);

                    // Compile content
                    $compile(this.$tip)(scope);
                    scope.$digest();

                    // Bind popover to the tip()
                    this.$tip.data('popover', this);

                    return r;
                };

                // Provide scope display functions
                scope.$popover = function(name) {
                    popover(name);
                };
                angular.forEach(['show', 'hide'], function(name) {
                    scope[name] = function() {
                        popover[name]();
                    };
                });
                scope.dismiss = scope.hide;

                // Emit popover events
                angular.forEach(['show', 'shown', 'hide', 'hidden'], function(name) {
                    element.on(name, function(ev) {
                        scope.$emit('popover-' + name, ev);
                    });
                });

            });

        }
    };

});
