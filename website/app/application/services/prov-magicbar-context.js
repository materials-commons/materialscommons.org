Application.Services.factory('provMagicBarContext', [provMagicBarContextService]);

function provMagicBarContextService() {
    var service = {
        _context: {
            name: "",
            attributes: null
        },

        set: function(name, attrs) {
            service._context.name = name;
            service._context.attributes = attrs;
        },

        clear: function() {
            service._context.name = "";
            service._context.attributes = null;
        },

        get: function() {
            return service._context;
        }
    };

    return service;
}
