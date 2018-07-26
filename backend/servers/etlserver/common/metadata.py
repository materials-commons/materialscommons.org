import json
import time
from materials_commons.api import create_experiment_metadata
from materials_commons.api import get_experiment_metadata_by_experiment_id


class Metadata:
    def __init__(self, apikey):
        self.time_stamp = time.ctime()
        self.excluded_keys = ["excluded_keys"]
        self.process_metadata = []
        self.input_excel_file_path = None
        self.input_data_dir_path = None
        self.project_id = None
        self.experiment_id = None
        self.header_row_end = None
        self.data_row_start = None
        self.data_row_end = None
        self.data_col_start = None
        self.data_col_end = None
        self.start_attribute_row = None
        self.sheet_headers = None
        self.apikey = apikey

    def write(self, experiment_id):
        metadata_dict = self.format()
        metadata = json.dumps(metadata_dict, indent=2)
        metadata_record = create_experiment_metadata(experiment_id, metadata, apikey=self.apikey)
        return metadata_record

    def read(self, experiment_id):
        metadata_record = get_experiment_metadata_by_experiment_id(experiment_id, apikey=self.apikey)
        if not metadata_record:
            return None
        metadata = json.loads(metadata_record.json)
        attr = ["time_stamp", "process_metadata", "project_id", "experiment_id",
                "input_excel_file_path", "input_data_dir_path",
                "header_row_end", "data_row_start", "data_row_end",
                "data_col_start", "data_col_end",
                "start_attribute_row", "sheet_headers"]
        for a in attr:
            setattr(self, a, metadata[a])
        return self

    def format(self):
        return dict(
            (key, value)
            for (key, value) in self.__dict__.items()
            if key not in self.excluded_keys
        )

    def set_input_information(self, input_path, data_dir):
        self.input_excel_file_path = input_path
        self.input_data_dir_path = data_dir

    def set_project_id(self, project_id):
        self.project_id = project_id

    def set_experiment_id(self, experiment_id):
        self.experiment_id = experiment_id

    def set_header_row_end(self, row):
        self.header_row_end = row

    def set_data_row_start(self, row):
        self.data_row_start = row

    def set_data_row_end(self, row):
        self.data_row_end = row

    def set_data_col_start(self, col):
        self.data_col_start = col

    def set_data_col_end(self, col):
        self.data_col_end = col

    def set_start_attribute_row(self, row):
        self.start_attribute_row = row

    def record_header(self, header):
        self.sheet_headers = header

    def set_process_metadata(self, row, start_col, end_col, template_id, process):
        self.process_metadata.append(
            {'id': process.id,
             'name': process.name,
             'template': template_id,
             'files': '',
             'start_row': row,
             'end_row': row + 1,
             'start_col': start_col,
             'end_col': end_col
             }
        )

    def update_process_metadata_end_row(self, row):
        self.process_metadata[-1]['end_row'] = row

    def update_process_files_list(self, files_entry):
        self.process_metadata[-1]['files'] = files_entry
