#!/usr/bin/env python
import rethinkdb as r
import json
import sys

if __name__ == "__main__":
    conn = r.connect("localhost", 30815, db="materialscommons")
    processes = r.table("processes")\
                 .get_all("b1915a4a-543f-4fff-ae8e-66916b0cbfa7", index="project_id")\
                 .run(conn, time_format="raw")
    by_ids = {p['id']: p for p in processes}
    all = list(r.table("property_sets")
               .get_all(*by_ids.keys(), index="item_id")
               .eq_join("id", r.table("properties"), index="item_id")
               .map(lambda row: row.merge({
                   "left": {
                       "ps_id": row["left"]["id"],
                       "ps_name": row["left"]["name"],
                       "ps_item_id": row["left"]["item_id"],
                       "ps_item_type": row["left"]["item_type"]
                   }
               }))
               .without({
                   "left": {
                       "id": True,
                       "name": True,
                       "item_id": True,
                       "item_type": True
                   }
               })
               .zip().run(conn, time_format="raw"))
    feeder_ids = [prop['value'] for prop in all
                  if prop["ptype"] == "file" or prop["ptype"] == "sample"]
    query = r.table("properties")\
             .get_all(*feeder_ids, index="value")\
             .eq_join("item_id", r.table("property_sets"))\
             .zip()\
             .eq_join("item_id", r.table("processes"))\
             .zip()
    print(json.dumps(list(query.run(conn, time_format="raw"))))
