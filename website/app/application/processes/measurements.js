
function Composition() {
    this.name = "Composition";
    this.attribute = "composition";
    this.description = "Composition of sample";
    this._type = "composition";
    this._category = "scalar";
    this.units = ["at%", "wt%"];
    this.nunit = "at%";
    this.unit = null;
    this.value = null;
}

function AreaFraction() {
    this.name = "Area fraction";
    this.attribute = "area_fraction";
    this.description = "";
    this._type = "fraction";
    this._category = "scalar";
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}

function VolumeFraction() {
    this.name = "Volume fraction";
    this.attribute = "volume_fraction";
    this.description = "";
    this._type = "fraction";
    this._category = "scalar";
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}

function DislocationDensity() {
    this.name = "Dislocation density";
    this.attribute = "dislocation_density";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "m^-2";
    this.unit = "m^-2";
    this.value = null;
}

function Length() {
    this.name = "Length";
    this.attribute = "length";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "m";
    this.unit = "m";
    this.value = null;
}

function Width() {
    this.name = "Width";
    this.attribute = "width";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "m";
    this.unit = "m";
    this.value = null;
}

function Height() {
    this.name = "Height";
    this.attribute = "height";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "m";
    this.unit = "m";
    this.value = null;
}

function Density() {
    this.name = "Density";
    this.attribute = "density";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "kg/m^3";
    this.unit = "kg/m^3";
    this.value = null;
}

function Volume() {
    this.name = "Volume";
    this.attribute = "volume";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "m^3";
    this.unit = "m^3";
    this.value = null;
}

function YoungsModulus() {
    this.name = "Young's modulus";
    this.attribute = "youngs_modulus";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "GPa";
    this.unit = "GPa";
    this.value = null;
}

function TensileYieldStrength() {
    this.name = "Tensile Yield Strength";
    this.attribute = "tensile_yield_strength";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "GPa";
    this.unit = "GPa";
    this.value = null;
}

function UltimateTensileStrength() {
    this.name = "Ultimate Tensile Strength";
    this.attribute = "ultimate_tensile_strength";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "GPa";
    this.unit = "GPa";
    this.value = null;
}

function StrainToFracture() {
    this.name = "Strain To Fracture";
    this.attribute = "strain_to_fracture";
    this.description = "";
    this._type = "fraction";
    this._category = "scalar";
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}

function SpaceGroup() {
    this.name = "Space Group";
    this.attribute = "space_group";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}

function PointGroup() {
    this.name = "Point Group";
    this.attribute = "point_group";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}

function CrystalSystem() {
    this.name = "Crystal System";
    this.attribute = "crystal_system";
    this.description = "";
    this._type = "string";
    this._category = "scalar";
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}

function BandGap() {
    this.name = "Band Gap";
    this.attribute = "band_gap";
    this.description = "";
    this._type = "number";
    this._category = "scalar";
    this.units = [];
    this.nunit = "eV";
    this.unit = "eV";
    this.value = null;
}

function FatigueLife() {
    this.name = "Fatigue Life";
    this.attribute = "fatigue_life";
    this.description = "";
    this._type = "pair";
    this._category = "Pairs";
    this.attribute1 = {
        name: "Stress ratio",
        attribute: "stress_ratio",
        _type: "fraction",
        units:[],
        unit: null
    };
    this.attribute2 = {
        name: "Cycles to failure",
        attribute: "cycles_to_failure",
        _type: "number",
        units:[],
        unit: null
    }
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}

function CrackGrowth() {
    this.name = "Crack Growth";
    this.attribute = "crack_growth";
    this.description = "";
    this._type = "pair";
    this._category = "Pairs";
    this.attribute1 = {
        name: "Stress intensity",
        attribute: "stress_intensity",
        _type: "number",
        units:[],
        unit: "GPa*m^(1/2)"
    };
    this.attribute2 = {
        name: "da/dN",
        attribute: "da_dn",
        _type: "number",
        units:[],
        unit: "m/cycle"
    }
    this.units = [];
    this.nunit = "";
    this.unit = null;
    this.value = null;
}



















