#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import elasticsearch


def main(rethinkdb_port, elasticsearch_port):
    conn = r.connect("localhost", rethinkdb_port, db="samplesdb")
    es = elasticsearch.Elasticsearch(hosts=[
        {
            "host": "localhost",
            "port": elasticsearch_port
        }
    ])

    samples = list(r.table("samples")
                   .eq_join("id", r.table("sample2attribute_set"),
                            index="sample_id")
                   .zip()
                   .merge(lambda aset: {
                       "attributes": r.table("attribute_set2attribute")
                       .get_all(aset["attribute_set_id"],
                                index="attribute_set_id")
                       .eq_join("attribute_id", r.table("attributes"))
                       .zip()
                       .merge(lambda attr: {
                           "best_measure": r.table("measurements")
                           .get(attr["best_measure_id"]),
                           "history": r.table("best_measure_history")
                           .get_all(attr["id"], index="attribute_id")
                           .merge(lambda best: {
                               "measurement": r.table("measurements")
                               .get(best["measurement_id"]).default({})
                           })
                           .coerce_to("array"),
                           "measurements": r.table("attribute2measurement")
                           .get_all(attr["id"], index="attribute_id")
                           .eq_join("measurement_id", r.table("measurements"))
                           .zip()
                           .coerce_to("array")
                       })
                       .coerce_to("array")
                   })
                   .run(conn, time_format="raw"))
    for sample in samples:
        es.index(index="samples", doc_type="sample", id=sample['id'],
                 body=sample)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-r", "--rethinkdb-port", dest="rethinkdb_port",
                      type="int", help="rethinkdb port", default=30815)
    parser.add_option("-e", "--elasticsearch-port", dest="elasticsearch_port",
                      type="int", help="elasticsearch port", default=9200)
    (options, args) = parser.parse_args()
    main(options.rethinkdb_port, options.elasticsearch_port)
