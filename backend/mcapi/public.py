from mcapp import app
from decorators import crossdomain, apikey, jsonp
import json
from flask import jsonify, g, request
import rethinkdb as r
from loader.model import user
import dmutil
from utils import  make_password_hash
import error
from args import json_as_format_arg
from mcexceptions import NoSuchItem
import access
import args


@app.route('/tags')
@jsonp
def all_tags():
    selection = list(r.table('tags').run(g.conn))
    return json.dumps(selection)


@app.route('/tags/count')
@jsonp
def tags_by_count():
    selection = list(r.table('tags').run(g.conn))
    return get_the_count(selection)


def get_the_count(selection):
    tagsCount = []
    for tag in selection:
        c = r.table('tag2item').get_all(tag[u'id'], index='tag_id').count().run(g.conn)
        tagsCount.append({'name': tag[u'id'], 'count': c})
    return json_as_format_arg(tagsCount)


@app.route('/tag/<item_type>/<item_id>', methods=['POST'])
@crossdomain(origin='*')
@apikey
def tag(item_type, item_id):
    j = request.get_json()
    tag = dict()
    tag['id'] = dmutil.get_required('id', j)
    entry = dmutil.entry_exists('tags', tag['id'])
    if entry:
        tag2item_id =  join_tag_and_item(tag['id'], item_id, item_type)
        return dmutil.get_single_from_table('tag2item', tag2item_id)
    else:
        tag_id = dmutil.insert_entry_id('tags', tag)
        if (tag_id):
            tag2item_id =  join_tag_and_item(tag_id, item_id, item_type)
            return dmutil.get_single_from_table('tag2item', tag2item_id)


def join_tag_and_item(tag_id, item_id, item_type):
    tag_to_item = {'tag_id': tag_id, 'item_id': item_id, 'item_type': item_type}
    tag2item_id = dmutil.insert_entry_id('tag2item', tag_to_item)
    return tag2item_id
    

@app.route('/tag/<tag>', methods=['DELETE'])
@crossdomain(origin='*')
@apikey
def delete_tag(tag):
    entry = dmutil.item_exists('tag2item', tag)
    if entry:
        rr = r.table('tag2item').get(tag).delete().run(g.conn)
        return json.dumps(entry)
    raise NoSuchItem()


@app.route('/tags/list/<item_type>/<item_id>', methods=['GET']) 
@jsonp
@apikey
def tags_for_item(item_type, item_id):
    rr = list(r.table('tag2item').filter({'item_id': item_id}).run(g.conn))
    return json.dumps(rr)


@app.route('/tags/byitem/<tag>', methods=['GET']) 
@jsonp
@apikey(shared=True)
def tags_by_itemtype(tag):
    all_tags = []
    rr = r.table('tag2item').get_all(tag, index='tag_id').eq_join('item_id', r.table('datafiles')).zip()
    rr = args.add_all_arg_options(rr)
    datafiles = list(rr.run(g.conn, time_format='raw'))
    for df in datafiles:
        rr = list(r.table('tag2item').get_all(df['id'], index='item_id').pluck('tag_id').run(g.conn))
        all_tags.append({'item': df, 'tags_list':rr, 'type': 'datafile'})
    pv = r.table('tag2item').get_all(tag, index='tag_id').eq_join('item_id', r.table('processes')).zip()
    pv = args.add_all_arg_options(pv)
    processes = list(pv.run(g.conn, time_format='raw'))
    for p in processes:
        rr = list(r.table('tag2item').get_all(p['id'], index='item_id').pluck('tag_id').run(g.conn))
        all_tags.append({'item': p, 'tags_list':rr, 'type':'process'})
    return args.json_as_format_arg(all_tags)


@app.route('/public/datafiles')
@jsonp
def list_public_datafiles():
    selection = list(r.table('datafiles').
                     filter({'access': 'public'}).
                     run(g.conn, time_format='raw'))

    return json.dumps(selection)


@app.route('/public/usergroups')
@jsonp
def list_usergroups():
    selection = list(r.table('usergroups').
                     filter({'access': 'public'}).
                     run(g.conn, time_format='raw'))
    return json.dumps(selection)


@app.route('/news', methods=['GET'])
@jsonp
def get_news():
    selection = list(r.table('news').order_by(r.desc('date')).run(g.conn))
    return json.dumps(selection)


@app.route('/news/new', methods=['POST'])
@crossdomain(origin='*')
@apikey
def create_news():
    inserted = r.table('news').insert(request.get_json()).run(g.conn)
    return jsonify(inserted)


@app.route('/news/<id>', methods=['DELETE'])
@crossdomain(origin='*')
@apikey
def delete_news(id):
    rv = r.table('news').get(id).delete().run(g.conn)
    return jsonify(rv)


@app.route('/public/datadirs')
@jsonp
def list_public_datadirs():
    selection = list(r.table('datadirs').
                     filter({'access': 'public'}).
                     run(g.conn, time_format='raw'))
    return json.dumps(selection)


@app.route('/users', methods=['GET'])
@jsonp
def list_users():
    selection = list(r.table('users').pluck('email', 'id').run(g.conn))
    return json.dumps(selection)


@app.route('/newuser', methods=['POST'])
@crossdomain(origin='*')
def create_user():
    j = request.get_json(silent=False)
    email = dmutil.get_required('email', j)
    password = dmutil.get_required('password', j)
    exists = r.table('users').get(email).run(g.conn)
    if exists is None:
        password_hash = make_password_hash(password)
        u = user.User(email, email, password_hash)
        r.table('users').insert(u.__dict__).run(g.conn)
        return json.dumps({'apikey': u.apikey})
    else:
        return error.already_exists(
            "Unable to create account %s, user already exists" % (email))