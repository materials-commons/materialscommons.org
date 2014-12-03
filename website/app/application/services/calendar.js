Application.Services.factory('calendarEvents', ["$filter", calendarService]);

function calendarService($filter) {
    var service = {

        groupEventsByDate: function (events) {
            var d = new Date(0);
            events.forEach(function (event) {
                event.converted_mtime = $filter('toDateString')(event.mtime);
            });
            //Group By date
            var grouped_events = $filter('groupBy')(events, 'converted_mtime');
            var events_by_date = [];
            if (grouped_events !== {}) {
                Object.keys(grouped_events).forEach(function (key) {
                    var value = grouped_events[key][0];
                    d.setUTCSeconds(value.mtime.epoch_time);
                    events_by_date.push({title: value.title, start: d});
                });
            }
            return events_by_date;
        }
    };
    return service;
}
