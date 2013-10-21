from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
import json
from flask import jsonify, g, request, send_from_directory
from ..utils import mkdirp
import rethinkdb as r
import os.path
import os
import pika
from ..args import json_as_format_arg
import tempfile

@app.route('/v1.0/user/<user>/udqueue')
@apikey
@jsonp
def get_udqueue(user):
    selection = list(r.table('udqueue').filter({'owner':user}).run(g.conn))
    return json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/upload', methods=['POST'])
@apikey
@crossdomain(origin='*')
def upload_file(user):
    process_id = request.form['process_id']
    project_id = request.form['project_id']
    tdir = tempfile.mkdtemp(dir='/tmp/uploads')
    mkdirp('/tmp/uploads')
    for key in request.files.keys():
        datadir = request.form[key + "_datadir"]
        file = request.files[key]
        dir = os.path.join(tdir, project_id, process_id, datadir)
        mkdirp(dir)
        filepath = os.path.join(dir, file.filename)
        file.save(filepath)
    #putRequestOnQueue(filepath, user, material_condition_id, equipment_condition_id)
    return jsonify({'success': True})

def putRequestOnQueue(filepath, user, material_condition_id, equipment_condition_id):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='data_loader', durable=True)
    message = {}
    message['dirpath'] = baseDirpath(filepath)
    message['user'] = user
    message['material_condition_id'] = material_condition_id
    message['equipment_condition_id'] = equipment_condition_id
    channel.basic_publish(exchange='', routing_key='data_loader', body=json.dumps(message),\
                              properties=pika.BasicProperties(delivery_mode=2)) 
    connection.close()

def baseDirpath(filepath):
    i = getFourth(filepath)
    return filepath[0:i]

def getFourth(s):
    count = 0
    index = 0
    for c in s:
        if c == '/':
            count = count+1
        if count == 4:
            break
        index = index + 1
    return index

@app.route('/v1.0/user/<user>/download/file/<path:datafile>')
#@apikey
def download_file(user, datafile):
    return send_from_directory('/tmp', 'ReviewQueue.png', as_attachment=True)
    #df = r.table('datafiles').get(datafile).run(g.conn)
    #if not checkAccess(user, df):
    #   return error_not_found_response()
    #return None
