#!/bin/sh
KEY=$1
curl --verbose -XPOST -H"Content-Type: application/json" -d'{"template_type": "condition","template_name": "material_conditions","owner": "mcfada@umich.edu","template_description": "Describes the properties, conditions and type of material used.","properties": [{"name":"alloy_name","value":""}, {"name":"known_composition", "value":""}, {"name":"manufacturing_condition", "value":""}, {"name":"heat_treatment","value":""}]}' 'http://localhost:5000/v1.0/templates?apikey='${KEY}'&user=mcfada@umich.edu'
