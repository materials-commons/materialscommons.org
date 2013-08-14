
function setActiveMainNav(nav) {
    $('#mc-main-navs li').removeClass("active");
    $(nav).addClass("active");
}

function mcurl() {
    var apihost = mcglobals.apihost ? mcglobals.apihost : "https://api.materialscommons.org:5000/v1.0";
    console.log(apihost);

    if (arguments.length < 1)
    {
        throw "Invalid mcurl spec";
    }

    var s = arguments[0];

    for (var i = 1; i < arguments.length; i++)
    {
        s = s.replace('%', arguments[i]);
    }

    var url = apihost + s + "?apikey=" + mcglobals.apikey;
    console.log(url);
    return url;
}

function mcurljsonp() {
    return mcurl.apply(this, arguments) + "&callback=JSON_CALLBACK";
}

function get_utc_obj(utc_in_sec) {
    var d = new Date(utc_in_sec * 1000);
    return d;
}

