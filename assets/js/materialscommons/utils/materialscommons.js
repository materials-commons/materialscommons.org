function setActiveMainTab(tab) {
    $('#mc-main-tabs li').removeClass("mc-active");
    $(tab).addClass("mc-active");
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