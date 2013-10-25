from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request, jsonify
import rethinkdb as r
from ..utils import set_dates
from .. import args
from .. import error
from .. import dmutil

@app.route('/v1.0/user/<user>/reviews')
@apikey
@jsonp
def get_reviews(user):
    selection = list(r.table('reviews').filter({'owner':user}).run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/reviews/requested')
@apikey
@jsonp
def get_reviews_requested(user):
    selection = list(r.table('reviews').filter({'who':user}).filter(r.row['owner'] != user)\
                     .run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/review/<id>', methods=['DELETE'])
@apikey
@crossdomain(origin='*')
def delete_review(user, id):
    rv = r.table('reviews').filter({'owner':user, 'id':id}).delete().run(g.conn)
    return jsonify(rv)

@app.route('/v1.0/user/<user>/review', methods=['POST'])
@apikey
@crossdomain(origin='*')
def add_review(user):
    review = request.get_json()
    review['marked_on'] = r.now()
    set_dates(review)
    return dmutil.insert_entry('reviews', review)

@app.route('/v1.0/user/<user>/datafile/reviews/<path:datafileid>')
@apikey
@jsonp
def get_reviews_for_datafileid(user, datafileid):
    selection = list(r.table('reviews').filter({'item_id':datafileid}).run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/review/<reviewid>/mark/<markas>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def mark_review(user, reviewid, markas):
    if markas == 'true' or markas == 'false':
        r.table('reviews').get(reviewid).update({'done': markas == 'true'}).run(g.conn)
        return jsonify({'id': reviewid})
    else:
        return error.bad_request("How to mark review improperly specified: " + markas)
