from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request, jsonify
import rethinkdb as r
from ..utils import set_dates
from .. import args
from .. import error
from .. import dmutil
from .. import access
import json


@app.route('/reviews')
@apikey(shared=True)
@jsonp
def get_reviews():
    user = access.get_user()
    selection = list(r.table('reviews').filter({'owner':user}).run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/reviews/requested')
@apikey(shared=True)
@jsonp
def get_reviews_requested():
    user = access.get_user()
    selection = list(r.table('reviews').filter({'who':user}).filter(r.row['owner'] != user)\
                     .run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/review/<id>', methods=['DELETE'])
@apikey
@crossdomain(origin='*')
def delete_review(id):
    user = access.get_user()
    rv = r.table('reviews').filter({'owner':user, 'id':id}).delete().run(g.conn)
    return jsonify(rv)

@app.route('/review', methods=['POST'])
@apikey(shared=True)
@crossdomain(origin='*')
def add_review():
    user = access.get_user()
    review = request.get_json()
    review['marked_on'] = r.now()
    set_dates(review)
    review_id =  dmutil.insert_entry('reviews', review)
    json_review_id =  json.loads(review_id)
    if review_id:
        params = {'review_id': json_review_id['id'], 'datafile_id': review['item_id']}
        review_datafile_id =  dmutil.insert_entry('review2datafile', params)
        return review['item_id']
    
@app.route('/review/<reviewid>/mark/<markas>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def mark_review(reviewid, markas):
    user = access.get_user()
    r.table('reviews').get(reviewid).update({'status': markas}).run(g.conn)
    return jsonify({'id': reviewid})        
   
#Special case:  where we return objects instead of id's    
@app.route('/datafile/<datafile_id>/reviews')
@apikey(shared=True)
@jsonp
def get_reviews_for_datafile(datafile_id):
    selection = list(r.table('review2datafile').filter({'datafile_id': datafile_id}).eq_join('review_id', r.table('reviews')).run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


#@app.route('/datafile/reviews/<path:datafileid>')
#@apikey(shared=True)
#@jsonp
#def get_reviews_for_datafileid(datafileid):
#    user = access.get_user()
#    selection = list(r.table('reviews').filter({'item_id':datafileid}).run(g.conn, time_format='raw'))
#    if selection:
#        owner = selection[0]['owner']
#        access.check(user, owner)
#    return args.json_as_format_arg(selection)


