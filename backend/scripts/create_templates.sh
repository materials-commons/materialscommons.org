#!/bin/sh -x
KEY=$1
PORT=$2


curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "condition","template_name": "sem_equipment_properties","owner": "gtarcea@umich.edu","template_description": "Describes the properties and settings for the SEM.","properties": [{"name":"microscope_mfg","value":""}, {"name":"microscope_model", "value":""}, {"name":"microscope_type", "value":["Ion", "Electron"]}, {"name":"voltage","value":""}, {"name":"current", "value":""}, {"name":"specimen", "value":""}, {"name":"specimen_prep", "value":["Electropolish", "Silica finish"]}]}' 'http://localhost:'${PORT}'/templates/new?apikey='${KEY}

curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "condition","template_name": "material_properties","owner": "gtarcea@umich.edu","template_description": "Describes the properties, conditions and type of material used.","properties": [{"name":"alloy_name","value":""}, {"name":"known_composition", "value":""}, {"name":"manufacturing_condition", "value":""}, {"name":"heat_treatment","value":""}]}' 'http://localhost:'${PORT}'/templates/new?apikey='${KEY}

curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "process","template_name": "SEM","owner": "gtarcea@umich.edu","template_description": "Collect data using an SEM.","required_output_conditions": ["material_properties"], "required_conditions": ["sem_equipment_properties", "material_properties"], "required_input_files": "no", "required_output_files": "no"}' 'http://localhost:'${PORT}'/templates/new?apikey='${KEY}

curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "process","template_name": "APT","owner": "gtarcea@umich.edu","template_description": "Collect data using an APT.","required_conditions": ["material_properties"], "required_output_conditions": [], "required_input_files": "yes", "required_output_files": "no"}' 'http://localhost:'${PORT}'/templates/new?apikey='${KEY}

curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "process","template_name": "Data Analysis","owner": "gtarcea@umich.edu","template_description": "Perfomed analysis on set of data.","required_conditions": [], "required_output_conditions": [], "required_input_files": "yes", "required_output_files": "yes"}' 'http://localhost:'${PORT}'/templates/new?apikey='${KEY}
