function Sample() {
    this.name = "";
    this.files = [];
    this.property_set_id = "";
    this.properties = [];       // is an array of object ExistingProperty()
    this.new_properties = [];   // is an array of NewProperty()
    this.transformed_properties = []; // is an array of TransformedProperty()
    this.new_sample = false;   // if its new sample there won't be an id and property_set_id
}

function ExistingProperty() {
    this.name = "";
    this.attribute = "";
    this.property_id = "";
    this.measurements = [];    // is an array of SampleMeasurement()
}

function NewProperty() {
    this.name = "";
    this.attribute = "";
    this.measurements = [];   // is an array of SampleMeasurement()
}


function TransformedProperty() {
    this.name = "";
    this.attribute = "";
    this.property_id = "";
    this.action = ""; //Action can be share/copy/unknown
}

function SampleMeasurement() {
    this.value = "";
    this.unit = "";
    this._type = "";
}

function SampleFile() {
    this.file_id = "";
    this.name = "";
}