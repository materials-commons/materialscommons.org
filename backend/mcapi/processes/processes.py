import rethinkdb as r
from ..mcapp import app
from ..decorators import apikey


@app.route("/processes", methods=["GET"])
@apikey
def get_processes():
    pass


@app.route("/processes/<project_id>/template", methods=["POST"])
@apikey
def create_process_from_template():
    pass
