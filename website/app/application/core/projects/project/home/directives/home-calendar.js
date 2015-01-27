Application.Directives.directive("homeCalendar", homeCalendarDirective);
function homeCalendarDirective() {
    return {
        restrict: "A",
        controller: 'homeCalendarController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-calendar.html'
    };
}

Application.Controllers.controller("homeCalendarController",
                                   ["$scope", "Events", "uiCalendarConfig",
                                    "$compile", "$timeout" ,"ui",
                                    homeCalendarController]);
function homeCalendarController($scope, Events, uiCalendarConfig, $compile, $timeout, ui) {
    $scope.project = Events.addConvertedTime($scope.project);

    $scope.event_reviews = {
        color: '#4884b8',
        events: Events.prepareCalendarEvent($scope.project.reviews, "reviews")
    };
    $scope.event_notes = {
        color: '#3ea7a0',
        events: Events.prepareCalendarEvent($scope.project.notes, "notes")
    };
    $scope.event_processes = {
        color: '#e26a6a',
        events: Events.prepareCalendarEvent($scope.project.processes, "processes")
    };
    $scope.event_samples = {
        color: '#f0ad4e',
        events: Events.prepareCalendarEvent($scope.project.samples, "samples")
    };

    var previous = '';
    $scope.alertOnDayClick = function (date, jsEvent, view, type) {
        if (previous !== '') {
            previous.css('background-color', '');
        }
        $(this).css('background-color', 'lightgrey');
        var d = date._d;
        var clicked_date = Date.UTC(d.getUTCFullYear(), (d.getUTCMonth()), d.getUTCDate());
        var day = d.getUTCDate()+1;
        var next_date = Date.UTC(d.getUTCFullYear(), (d.getUTCMonth()), day);
        if (!type){
            var temp = new Date(next_date);
            $scope.alertMessage = ( temp.toDateString() + '  was clicked !');
        }
        $scope.project = Events.updateDate($scope.project, clicked_date, next_date);
        previous = $(this);
    };

    $scope.alertOnEventClick = function(event, jsEvent, view) {
        var date = event.start;
        $scope.alertMessage = (event.title + '  on  ' + date._d.toDateString()  +
        ' was clicked ! ' + ' Filtered all items for ' + date._d.toDateString());
        $scope.alertOnDayClick(date, jsEvent, view, 'eventclick');
    };

    $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    $scope.eventRender = function(event, element, view) {
        $timeout(function() {
            $(element).attr('tooltip', event.description);
            $compile(element)($scope);
        });
    };

    $scope.closeAlert = function(){
        $scope.alertMessage = '';
    } ;

    $scope.eventSources = [$scope.event_reviews, $scope.event_notes, $scope.event_processes, $scope.event_samples];

    $scope.uiConfig = {
        calendar: {
            height: 450,
            editable: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            dayClick: $scope.alertOnDayClick,
            eventClick: $scope.alertOnEventClick,
            eventRender: $scope.eventRender
        }
    };
}
