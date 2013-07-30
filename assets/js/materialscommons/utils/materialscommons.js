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
    var hostname = document.location.hostname;
    return 'http://' + hostname + ':5000/materialscommons/api/v1.0' + path + '?callback=JSON_CALLBACK';
}

function mcurljsonpu(path, User) {
    var hostname = document.location.hostname;
    return 'http://' + hostname + ':5000/materialscommons/api/v1.0/user/' + User.get_username() + path + '?callback=JSON_CALLBACK';
}

function mcurljsonpu2(path, arg, User) {
    var hostname = document.location.hostname;
    return 'http://' + hostname + ':5000/materialscommons/api/v1.0/user/' + User.get_username() + path + '/' + arg + '?callback=JSON_CALLBACK';
}