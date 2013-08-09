function setActiveMainNav(nav) {
    $('#mc-main-navs li').removeClass("active");
    $(nav).addClass("active");
}

function microstructureCount(properties) {
    return countForProperty("microstructure", properties);
}

function mechanicalCount(properties) {
    return countForProperty("mechanical", properties);
}

function simulationCount(properties) {
    return countForProperty("simulation", properties);
}

function computationalCount(properties) {
    return countForProperty("computational", properties);
}

function countForProperty(property, properties) {
    if (!properties) {
        return 0;
    }
    var count = 0;
    for (i = 0; i < properties.length; i++) {
        if (properties[i].type == property) {
            count++;
        }
    }

    return count;
}

function mcurljsonp(path) {
    return asjsonp(mcservicepath2(path));
}

function mcurljsonpu(path, User) {
    return asjsonp(mcserviceupath2(User, path));
}

function mcurljsonpu2(path, arg, User) {
    return asjsonp(mcserviceupath2(User, path, arg));
}

function mcurlu2(path, arg, User) {
    return mcserviceupath2(User, path, arg);
}

function asjsonp(url) {
    return url + '?callback=JSON_CALLBACK';
}

function mcurl2(path, arg) {
    return mcservice() + path + '/' + arg;
}

function myhost() {
    return document.location.hostname;
}

function mchosturl() {
    return 'http://' + myhost() + ':5000';
}

function mcservice() {
    return mchosturl() + '/v1.0';
}

function mcservicepath2(path, arg) {
    var url =  mcservice() + path;
    if (arg) {
        return url + '/' + arg;
    }
    else {
        return url;
    }
}

function mcserviceu(User) {
    return mcservice() + '/user' + '/' + User.get_username();
}

function mcserviceupath2(User, path, arg) {
    var url = mcserviceu(User) + path;
    if (arg) {
        return url + '/' + arg;
    }
    else {
        return url;
    }
}
