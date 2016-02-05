(function (module) {
    module.directive("homeCalendar", homeCalendarDirective);
    function homeCalendarDirective() {
        return {
            restrict: "A",
            controller: 'HomeCalendarController',
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/home/directives/home-calendar.html'
        };
    }

    ///////////////////////////////////////////

    module.controller("HomeCalendarController", HomeCalendarController);

    HomeCalendarController.$inject = ["$scope", "Events", "uiCalendarConfig",
        "$compile", "$timeout", "ui", "$state"];

    /* @ngInject */
    function HomeCalendarController($scope, Events, uiCalendarConfig, $compile, $timeout, ui, $state) {
        $scope.project = Events.addConvertedTime($scope.project);

        var eventReviews = {
            color: '#4884b8',
            events: Events.prepareCalendarEvent($scope.project.reviews, "reviews")
        };
        var eventNotes = {
            color: '#3ea7a0',
            events: Events.prepareCalendarEvent($scope.project.notes, "notes")
        };
        var eventProcesses = {
            color: '#e26a6a',
            events: Events.prepareCalendarEvent($scope.project.processes, "processes")
        };
        var eventSamples = {
            color: '#f0ad4e',
            events: Events.prepareCalendarEvent($scope.project.samples, "samples")
        };

        var previous = '';


        $scope.goHome = function () {
            //When they clear the filter it should reset the panel state
            // and day click should be today's date
            ui.resetPanels($scope.project.id);
            var date = {'_d': new Date()};
            alertOnDayClick(date, '', '', '');
            closeAlert();
        };

        $scope.eventSources = [eventReviews, eventNotes, eventProcesses, eventSamples];

        $scope.ready = false;
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: false,
                header: {
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                },
                dayClick: alertOnDayClick,
                eventClick: alertOnEventClick,
                eventRender: eventRender
            }
        };

        $timeout(function () {
            // Make sure the calendar directive has loaded, but running the ng event loop
            // before setting ready to true which then renders in the ng-if.
            $scope.ready = true;
        });

        /////////////////

        function alertOnDayClick(date, jsEvent, view, type) {
            if (previous !== '') {
                previous.css('background-color', '');
            }
            $(this).css('background-color', 'lightgrey');
            var d = date._d;
            var clicked_date = Date.UTC(d.getUTCFullYear(), (d.getUTCMonth()), d.getUTCDate());
            var day = d.getUTCDate() + 1;
            var next_date = Date.UTC(d.getUTCFullYear(), (d.getUTCMonth()), day);
            if (!type) {
                var temp = new Date(next_date);
                $scope.alertMessage = ( 'Showing items for ' + temp.toDateString());
            }
            $scope.project = Events.updateDate($scope.project, clicked_date, next_date);
            previous = $(this);
        }

        function alertOnEventClick(event, jsEvent, view) {
            var date = event.start;
            var what = event.title.split(' ')[1];
            switch (what){
                case "processes":
                    $state.go('projects.project.processes.list');
                    break;
                case "samples":
                    $state.go('projects.project.samples.list');
                    break;
                case "reviews":
                    $state.go('projects.project.reviews');
                    break;
            }
            //ui.showPanelByCalendarEvent($scope.project.id, what);
            //alertOnDayClick(date, jsEvent, view, 'eventclick');
        }

        function changeView(view, calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        }

        function eventRender(event, element) {
            element.attr('title', event.tooltip);
        }

        function closeAlert() {
            $scope.alertMessage = '';
        }
    }
}(angular.module('materialscommons')));
