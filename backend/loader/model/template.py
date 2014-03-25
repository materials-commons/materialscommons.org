import rethinkdb as r

#
# A template is a step in the provenance. It may be the process,
# or a input or output step.
#
# These templates are a part of a process, and define the various
# steps in the provenance process that we need to prompt for.
class Template(object):
    def __init__(self):
        #
        # A model contains the list of property attributes that
        # we will prompt for in a step. For example if a user needs
        # to specify the temperature, that will be an entry in the model.
        # See the ModelItem class below for an example of what this looks like.
        self.model = []
        self.owner = ""
        self.template_birthtime = r.now()
        self.template_description = ""
        self.template_mtime = self.template_birthtime
        self.template_name = ""
        # A pick is used in the front end to denote a item from the
        # database that they would need to choose. For example if the
        # user needs to pick a sample at some point, then pick would
        # be sample.
        self.template_pick = ""

        # Currently the valid types are: condition, process.
        self.template_type = ""

class ModelItem(object):
    def __init__(self):
        self.name = ""
        self.required = False

        # type can be "text", "number", "email", "url". These currently
        # correspond to the input types in the html input element.
        self.type = "text"

        # unit specifies the unit of measurement for a particular entry.
        # As a short cut some templates where there is only one choice
        # will fill this in.
        self.unit = "K"

        # This is a list of possible unit choices. It can also
        # be set to "" to denote no choices.
        self.unit_choice = []

        # value is a placeholder where the user will fill in the value
        # of a choice in the frontend. This exists only for use in the
        # front end.
        self.value = ""

        # value_choice is used when we want to present a selection
        # box to the user for values they can choose.
        self.value_choice

        # attribute is the name of item when we save it to the database
        self.attribute = ""

class ProcessTemplate(object):
    def __init__(self):
        # document this as we define it
        pass
