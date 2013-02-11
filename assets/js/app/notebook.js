
function setupWizard() {
}

var experimentName = "";

//function microstructurePicked(value) {
//    if (value == "NONE") { return ; }
//    $('#microstructure').append('<li><a href="#">' + value + '</a></li>');
//    $('#experimentBuild').empty();
//    $('#experiment').jOrgChart({
//        chartElement:'#experimentBuild'
//    });
//}

function showExperimentLayout() {
    $('#experimentLayoutBuild').empty();
    $('#experimentDetail').jOrgChart({
        chartElement:'#experimentLayoutBuild'
    });
}

function saveExperiment() {
    var description = $('#description').val();
    var microstructures = [];
    $('#microstructure li').each(function() {
        microstructures.push($(this).text());
    });
    var doc = {
        "type":"experiment",
        "name":experimentName,
        "description":description,
        "microstructure":microstructures,
        "mechanical":[],
        "simulation":[]
    };

    $.couch.db("materialscommons").saveDoc(doc, {
        success:function (data) {
            alert("Saved new experiment");
        },

        error:function (status) {
            alert("Failed to save experiment: " + status);
        }
    });
}

function showValuesForValidation() {
    var lab = $('#lab').val();
    var description = $('#description').val();
    var metal = $('#metal').val();
    var thickness = $('#thickness').val();
    var etype = $('#etype').val();

    experimentName = $('#lab').val() + '-' + $('#metal').val() + '-TEST' + Math.floor((Math.random() * 10000) + 1);

    $('#tab4').empty();
    $('#tab4').append('<label>Lab:' + lab + '</label>');
    $('#tab4').append('<label>Description:' + description + '</label>');
    $('#tab4').append('<label>Metal:' + metal + '</label>');
    $('#tab4').append('<label>thickness:' + thickness + '</label>');
    $('#tab4').append('<label>Type:' + etype + '</label>');
}

function doneFillingOutDetails() {
    var lab = $('#lab').val();
    var description = $('#description').val();
    var metal = $('#metal').val();
    var thickness = $('#thickness').val();

    experimentName = $('#lab').val() + '-' + $('#metal').val() + '-TEST' + Math.floor((Math.random() * 10000) + 1);

    $('#c1').collapse('hide');
    $('#experimentName').remove();
    $('#chart-experiment').prepend('<a href="#" id="experimentName">' + experimentName + '</a>');
    $('#experimentBuild').empty();
}
