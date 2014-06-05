#!/usr/bin/env python

import rethinkdb as r

conn = r.connect("localhost", '30815', "materialscommons")

class Material:
    def __init__(self, name, email):
        self.name = name;
        self.contact_email = email;
        self.birthtime = r.now();

def construct_material():
    new_material = Material("Al Ni", "tammasr@umich.edu")
    rr = r.table('materials').insert(new_material.__dict__).run(conn)
    

if __name__ == "__main__":
    construct_material()

