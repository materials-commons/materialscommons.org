from ..mcapp import app
from ..decorators import jsonp
import rethinkdb as r
from flask import g, request
from .. import dmutil

@app.route('/notes/<project_id>', methods=['GET'])
@jsonp
def get_notes(project_id):
    all = dict()
    rr = list(r.table('notes').get_all(project_id, index='project_id')
              .run(g.conn))
    all['notes'] = rr
    return dmutil.jsoner(all)


@app.route('/notes', methods=['POST'])
def add_note():
    j = request.get_json()
    #in process
    return
