Application.Services.factor('projectColors', [projectColorsService]);

function projectColorsService() {
    var service = {
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

        currentProjectIndex: 0,

        setCurrentProject: function(index) {
            service.currentProjectIndex = index;
        },

        getCurrentProjectColor: function() {
            return service.projectColors[service.currentProjectIndex];
        },

        getCurrentProjectColorLight: function() {
            return service.projectColorsLight[service.currentProjectIndex];
        }
    };

    return service;
}
