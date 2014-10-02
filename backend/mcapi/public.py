from mcapp import app
from decorators import crossdomain, apikey, jsonp
import json
from flask import jsonify, g, request
import rethinkdb as r
from loader.model import user
import dmutil
from utils import make_password_hash
import error
from args import json_as_format_arg
from mcexceptions import NoSuchItem
import args
from loader.model import item2tag

import access
from os.path import dirname, basename


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
        c = r.table('tag2item').get_all(tag[u'id'], index='tag_id')\
                               .count().run(g.conn)
        tagsCount.append({'name': tag[u'id'], 'count': c})
    return json_as_format_arg(tagsCount)


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
    



####function: Tag dataitem/datadir 
####First item2tag join tble record is created and then insert the tag into datadirs_denorm  table
@app.route('/item/tag/new', methods=['POST'])
@crossdomain(origin='*')
@apikey
def create_item2tag():
    j = request.get_json()
    user = access.get_user()
    item2tag = dict()
    item2tag['item_id'] = dmutil.get_required('item_id', j)
    item2tag['item_name'] = dmutil.get_required('item_name', j)
    item2tag['item_type'] = dmutil.get_required('item_type', j)
    item2tag['user'] = dmutil.get_required('user', j)
    item2tag['tag'] = dmutil.get_required('tag', j)
    fullname = dmutil.get_optional('fullname', j)
    datadir_id = dmutil.get_optional('datadir_id', j)
    tag_exists = list(r.table('items2tags').get_all(item2tag['item_id'], index='item_id').filter({'user': user, 'tag': item2tag['tag']}).run(g.conn))
    if tag_exists:
        return error.already_exists(
            "Duplicate entry. Tag Already exists")
    else:
        result = dmutil.insert_entry_id('items2tags', item2tag)
        if result:
            item2tag_join = r.table('items2tags').get(result).run(g.conn)
            #update datadir_denorm
            if item2tag_join['item_type'] == 'datafile':
                dir_name = dirname(fullname)
                #print dir_name
                dir_denorm = list(r.table('datadirs_denorm').get_all(dir_name, index='name').run(g.conn))
                if dir_denorm == []:
                    dir_denorm = list(r.table('datadirs_denorm').filter({'datadir_id': datadir_id}).run(g.conn))
                for each_dir_denorm in dir_denorm:
                    files = each_dir_denorm['datafiles']
                    for each_file in files:
                        if each_file['id'] == item2tag_join['item_id']:
                            if user in each_file['tags']:
                                each_file['tags'][user].append({'color': item2tag_join['tag']['color'] ,'name': item2tag_join['tag']['name'], 'icon': item2tag_join['tag']['icon']})
                            else:
                                print 'no user in tags..'
                                each_file['tags'] = {user : [{'color': item2tag_join['tag']['color'] ,'name': item2tag_join['tag']['name'], 'icon': item2tag_join['tag']['icon']}]}
                    r.table('datadirs_denorm').get(each_dir_denorm['id']).update({'datafiles': files}).run(g.conn)
            if item2tag_join['item_type'] == 'datadir':
                dir_denorm = {}
                dir_denorm = r.table('datadirs_denorm').get(item2tag_join['item_id']).run(g.conn)
                if user in dir_denorm['tags']:
                    dir_denorm['tags'][user].append({'color': item2tag_join['tag']['color'] ,'name': item2tag_join['tag']['name'], 'icon': item2tag_join['tag']['icon']})
                else:
                    dir_denorm['tags'] = {user : [{'color': item2tag_join['tag']['color'] ,'name': item2tag_join['tag']['name'], 'icon': item2tag_join['tag']['icon']}]}
                r.table('datadirs_denorm').get(item2tag_join['item_id']).update({'tags': dir_denorm['tags']}).run(g.conn)
        return result
