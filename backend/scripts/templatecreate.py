#!/usr/bin/env python

import rethinkdb as r

conn = r.connect("localhost", '30815', "materialscommons")

class Template:
    def __init__(self, template_type, template_name, owner):
        self.template_type = template_type
        self.template_name = template_name
        self.owner = owner
        self.template_description = ""
        now = r.now()
        self.template_birthtime = now
        self.template_mtime = now
        self.model = list()
        add_model_item(self, 'model', "", "", "","","")
        add_model_item(self, 'status', "", "", "","","")
        add_model_item(self, 'location', "", "", "","","")
        add_model_item(self, 'manufacturer', "", "", "","","")
       # add_model_item(self, 'required_conditions',
                      # ["Material Properties"] , "", "", "", "")
        #add_model_item(self, 'required_output_conditions', ["SEM Equipment Properties"],"","", "", "")
       # add_model_item(self, 'required_input_files', 'yes',"","", "", "")
        #add_model_item(self, 'required_output_files', 'yes',"","", "", "")
       # add_model_item(self, 'name', "","","","","")
        #add_model_item(self, 'description', "", "", "","","")
        #add_model_item(self, 'birthtime', r.now(), "", "","","")
       # add_model_item(self, 'mtime', r.now(), "", "","","")
        #add_model_item(self, 'machine', "", "", "","","")
        #add_model_item(self, 'process_type', "", "", "","","")
        #add_model_item(self, 'version', "", "", "","","")
        #add_model_item(self, 'parent', "", "", "","","")
        #add_model_item(self, 'notes', [], "", "","","")
        #add_model_item(self, 'runs', [], "", "","","")
        #add_model_item(self, 'citations', [], "", "","","")
        #add_model_item(self, 'status', "", "", "","","")
       

def add_model_item(template, name, value, value_choice, unit, unit_choice,  value_type):
    template.model.append({'name':name, 'value':value, "value_choice":value_choice, 
                              'unit':unit, 'unit_choice': unit_choice, 'type': value_type})


def create_template_using_constructor():
    template_obj = Template("machine", "Machine","gtarcea@umich.edu")
    rr = r.table('templates').insert(template_obj.__dict__).run(conn)
    print rr

if __name__ == "__main__":
    create_template_using_constructor()

