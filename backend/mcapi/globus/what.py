from .. import args
from ..mcapp import app
@app.route('/what', methods=['GET'])
def do_what_is_this():
    ret_packet = {'ok' : {'value' : 'test' }}
    return args.json_as_format_arg(ret_packet)
