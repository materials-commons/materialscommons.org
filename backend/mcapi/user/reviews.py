from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request, jsonify
import rethinkdb as r
from .. import args
from .. import dmutil
from .. import access
from .. import error
from loader.model import review


@app.route('/reviews/requested', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_reviews_requested():
    requested_reviews = []
    user = access.get_user()
    selection = list(r.table('reviews')
                     .get_all(user, index='author').order_by('project').eq_join('project', r.table('projects'))
                     .run(g.conn, time_format='raw'))
    for item in selection:
        review = item['left']
        project = item['right']
        review['project_name'] = project['name']
        requested_reviews.append(review)
    return args.json_as_format_arg(requested_reviews)


@app.route('/reviews/to_conduct', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_reviews_to_be_conducted():
    conduct_reviews = []
    user = access.get_user()
    selection = list(r.table('reviews')
                     .get_all(user, index='assigned_to').order_by('project').eq_join('project', r.table('projects'))
                     .run(g.conn, time_format='raw'))
    for item in selection:
        review = item['left']
        project = item['right']
        review['project_name'] = project['name']
        conduct_reviews.append(review)
    return args.json_as_format_arg(conduct_reviews)


@app.route('/reviews/<id>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_review(id):
    selection = r.table('reviews').get(id).run(g.conn, time_format='raw')
    return args.json_as_format_arg(selection)

@app.route('/reviews/<id>', methods=['DELETE'])
@apikey
@crossdomain(origin='*')
def delete_review(id):
    user = access.get_user()
    item = r.table('reviews').get(id).run(g.conn)
    if item is None:
        return error.not_found("No such review: %s" % id)
    if item['requested_to'] == user or item['requested_by'] == user:
        rv = r.table('reviews').get(id).delete().run(g.conn)
        return jsonify(rv)
    else:
        return error.not_authorized("User %s does not have access" % user)


@app.route('/reviews', methods=['POST'])
@apikey(shared=True)
@crossdomain(origin='*')
def add_review():
    j = request.get_json()
    assigned_to = dmutil.get_required('assigned_to', j)
    author = dmutil.get_required('author', j)
    r = review.Review(author, assigned_to)
    r.messages = dmutil.get_required('messages', j)
    r.items = dmutil.get_optional('items', j)
    r.title = dmutil.get_required('title', j)
    r.status = "open"
    print r.title + '***'
    r.project = dmutil.get_required('project', j)
    return  dmutil.insert_entry('reviews', r.__dict__)

@app.route('/reviews/<id>', methods=['PUT'])
@apikey(shared=True)
@jsonp
def update_review(id):
    j = request.get_json()
    messages = dmutil.get_optional('messages', j)
    status = dmutil.get_optional('status', j)
    items = dmutil.get_optional('items', j)
    if messages:
        rv = r.table('reviews').get(id).update({'messages': messages}).run(g.conn)
    if status:
        rv = r.table('reviews').get(id).update({'status': status}).run(g.conn)
    if items:
        rv = r.table('reviews').get(id).update({'items': items}).run(g.conn) 
    return jsonify(rv)
