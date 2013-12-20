#!/bin/sh
KEY=$1
curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "process","template_name": "Run SEM","owner": "mcfada@umich.edu","template_description": "Collect data using an SEM.",
"required_conditions":["sem_equipment_properties", "material_properties"]}' http://localhost:5000/test_templates/new?apikey=${KEY}

curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "condition","template_name": "sem_equipment_properties","owner": "mcfada@umich.edu","template_description": "Describes the properties and settings for the SEM.","properties": [{"name":"microscope_mfg","value":""}, {"name":"microscope_model", "value":""}, {"name":"microscope_type", "value":["Ion", "Electron"]}, {"name":"voltage","value":""}, {"name":"current", "value":""}, {"name":"specimen", "value":""}, {"name":"specimen_prep", "value":["Electropolish", "Silica finish"]}]}' 'http://localhost:5000/test_templates/new?apikey='${KEY}

curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "condition","template_name": "material_properties","owner": "mcfada@umich.edu","template_description": "Describes the properties, conditions and type of material used.","properties": [{"name":"alloy_name","value":""}, {"name":"known_composition", "value":""}, {"name":"manufacturing_condition", "value":""}, {"name":"heat_treatment","value":""}]}' 'http://localhost:5000/test_templates/new?apikey='${KEY}

