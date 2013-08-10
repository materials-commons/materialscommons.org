
function setActiveMainNav(nav) {
    $('#mc-main-navs li').removeClass("active");
    $(nav).addClass("active");
}

function mcurl() {
    var apihost = mcglobals.apihost ? mcglobals.apihost : "http://magnesium.eecs.umich.edu:5000/v1.0";

    if (arguments.length < 1)
    {
        throw "Invalid mcurl spec";
    }

    var s = arguments[0];

    for (var i = 1; i < arguments.length; i++)
    {
        s = s.replace('%', arguments[i]);
    }

    var url = apihost + s;
    return url;
}

function mcurljsonp() {
    return mcurl.apply(this, arguments) + "?callback=JSON_CALLBACK";
}

