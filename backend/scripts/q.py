#!/usr/bin/env python
import rethinkdb as r
import json

if __name__ == "__main__":
    conn = r.connect("localhost", 30815, db="materialscommons")
    pids = ["3b5d8aaa-67e0-4ea7-b4c7-ec0864029e60", "e65cb50d-6461-410e-9d27-56fb93486c2b", "286b4d3b-cdc8-4123-823f-d45377c77ebb"]
    all = list(r.table("property_sets")
               .get_all(*pids, index="item_id")
               .eq_join("id", r.table("properties"), index="item_id")
               .map(lambda row: row.merge({
                   "right": {
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
    print(json.dumps(all))
