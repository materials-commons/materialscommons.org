function AptInstrumentModeSetting() {
    this.name = "Mode";
    this.attribute = "mode";
    this.description = "";
    this.value = null;
    this.units = [];
    this.unit = null;
    this.otype = "selection";
    this.required = true;
    this.choices = [
        {name: "FIM", value: "fim"},
        {name: "Voltage", value: "voltage"},
        {name: "Laser", value: "laser"}
    ];
    this.validators = [];
}

function SpecimenTemperatureSetting() {
    this.name = "Specimen Temperature";
    this.attribute = "specimen_temperature";
    this.description = "";
    this.value = null;
    this.units = ["K", "F", "C"];
    this.unit = "";
    this.otype = "number";
    this.required = true;
    this.choices = [];
    this.validators = [];
}
