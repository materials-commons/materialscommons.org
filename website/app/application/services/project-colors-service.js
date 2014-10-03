Application.Services.factory('projectColors', [projectColorsService]);

function projectColorsService() {
    var service = {

        projectIDs: [],

        projectColors: [
            "#4a7a93",
            "#816c5b",
            "#926042",
            "#9a9980" ,
            "#577294",
            "#5c6957",
            "#61a0c3",
            "#ae9b69"
        ],

        projectColorsLight: [
            "#97C7E0",
            "#a9a18c",
            "#C59375",
            "#cccbb2",
            "#8AA5C7",
            "#8F9C8A",
            "#94D3F6",
            "#D4C18F"
        ],

        inactiveColor: "#536170",

        currentProjectIndex: 0,
        currentProjectID: 0,

        setCurrentProjectIndex: function(index) {
            service.currentProjectIndex = index;
            service.currentProjectID = service.projectIDs[index];
        },

        setCurrentProjectByID: function(id) {
            var i = _.indexOf(service.projectIDs, id);
            service.setCurrentProjectIndex(i);
        },

        getCurrentProjectColorClass: function() {
            return 'project_color_' + service.currentProjectIndex;
        },

        getCurrentProjectColor: function() {
            return service.projectColors[service.currentProjectIndex];
        },

        getCurrentProjectColorLightClass: function() {
            return 'project_color_' + service.currentProjectIndex + '_light';
        },

        getCurrentProjectColorLight: function() {
            return service.projectColorsLight[service.currentProjectIndex];
        },

        getProjectInactiveColorClass: function() {
            return 'project_inactive_color';
        },

        getInactiveColor: function() {
            return service.inactiveColor;
        },

        getActiveStyle: function(index) {
            return {
                background: service.projectColors[index],
                'border-bottom-style': 'solid',
                'border-bottom-color': service.projectColors[index]
            };
        },

        getInactiveStyle: function(index) {
            return {
                background: service.projectColorsLight[index]
            };
        },

        setProjectIDs: function(projects) {
            service.projectIds = [];
            for (var i = 0; i < projects.length; i++) {
                service.projectIDs.push(projects[i].id);
            }
            service.currentProjectID = projects[0].id;
        }
    };

    return service;
}
