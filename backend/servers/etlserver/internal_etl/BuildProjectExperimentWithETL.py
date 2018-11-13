import logging
import os
from .. import Path

from materials_commons.api import get_all_templates, get_project_by_id
from materials_commons.api import File as FileRecord
from ..common.utils import normalise_property_name
from ..common.worksheet_data import ExcelIO
from ..common.metadata import Metadata
from ..common.access_exceptions import NoSuchItem, RequiredAttributeException
from ..database.DatabaseInterface import DatabaseInterface


class BuildProjectExperiment:
    def __init__(self, apikey):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.apikey = apikey
        self.metadata = Metadata(apikey)
        self.etl_source_data = None
        self.project = None
        self.experiment_name = None
        self.experiment_description = None
        self.experiment = None
        self.data_start_row = None
        self.parent_process_list = None
        self.previous_row_key = None
        self.previous_parent_process = None
        self.process_values = {}
        self.process_files = {}
        self.data_directory = None
        self.suppress_data_upload = False
        self._make_template_table()

    def build(self, spread_sheet_path, data_dir_path, project_id, exp_name, exp_description=None):
        if not project_id:
            raise RequiredAttributeException("Project id not defined")
        self.project = get_project_by_id(project_id)
        if not self.project:
            raise NoSuchItem("Missing unexpected missing project; project_id = {}".format(project_id))
        self.metadata.set_project_id(self.project.id)

        self.experiment_name = exp_name
        self.experiment_description = exp_description
        if not self.experiment_description:
            self.experiment_description = "Experiment from ETL: excel file path = {}".format(spread_sheet_path)

        self.log.info("Building Experiment from ETL spreadsheet: ")
        self.log.info("  project: name = {}, id = {}".format(self.project.name, self.project.id))
        self.log.info("  spreadsheet = {}".format(spread_sheet_path))
        self.log.info("  data = {}".format(data_dir_path))

        self._set_etl_source_date_from_path(self.project, spread_sheet_path)

        self.metadata.set_input_information(spread_sheet_path, data_dir_path)
        self.data_directory = self._get_project_directory_from_path(data_dir_path)
        self.log.debug("  data directory name = {}".format(self.data_directory.name))

        self.suppress_data_upload = not self.data_directory

        self._create_base_experiment()

        self._set_row_positions()
        self._set_col_positions()

        # noinspection PyBroadException
        try:
            self._sweep()
        except BaseException:
            self.log.exception("Error in sweep")
            raise

        self._write_metadata()

        self.log.info("Context project: " + self.project.name + " (" + self.project.id + ")")
        self.log.info("With Experiment: " + self.experiment.name + " (" + self.experiment.id + ")")
        return {"status": "ok", "project_id": self.project.id, "experiment_id": self.experiment.id}

    def _write_metadata(self):
        self.log.debug("Writing metadata for experiment '" + self.experiment.name + "'")
        self.metadata.write(self.experiment.id)

    def _sweep(self):
        process_list = self._scan_for_process_descriptions()
        if len(process_list) == 0:
            self.log.error("No complete processes found in project")
        self.parent_process_list = []
        for index in range(self.data_start_row, len(self.etl_source_data)):
            self.parent_process_list.append(None)
        self.previous_row_key = None
        self.previous_parent_process = None
        for proc_data in process_list:
            self._sweep_process(proc_data)

    def _sweep_process(self, proc_data):
        start_col_index = proc_data['start_col']
        end_col_index = proc_data['end_col']
        template_id = proc_data['template']
        process_name = proc_data['name']
        self.log.debug("Sweep for process: " + process_name + " (" + template_id + ")")
        start_attribute_row_index = self._determine_start_attribute_row(start_col_index)
        self._record_header_rows()
        process_record = None

        self.log.info("Sweep, create process workflow, process name = {}".format(process_name))

        for row_index in range(self.data_start_row, len(self.etl_source_data)):
            row_key = self._row_key(row_index, start_col_index, end_col_index)
            if not row_key:
                self.previous_row_key = None
                continue
            process_index = row_index - self.data_start_row
            parent_process_record = self.parent_process_list[process_index]
            parent_process = None
            if parent_process_record:
                parent_process = parent_process_record['process']
            if self._start_new_process(row_key, parent_process):
                self.log.debug("Start new process: {} ({})".format(template_id, row_index))
                process = self.experiment.create_process_from_template(template_id)
                if not process.name == process_name:
                    process = process.rename(process_name)
                self.metadata.set_process_metadata(
                    row_index, start_col_index, end_col_index, template_id, process)
                output_sample = None
                if process.process_type == 'create':
                    sample_name = self._sweep_for_sample_name(
                        row_index, start_attribute_row_index, start_col_index, end_col_index)
                    if not sample_name:
                        sample_name = row_key
                    sample_names = [sample_name]
                    samples = process.create_samples(sample_names=sample_names)
                    output_sample = samples[0]
                elif process.process_type == 'transform' and parent_process_record:
                    input_sample = parent_process_record['output_sample']
                    process = process.add_input_samples_to_process([input_sample]) \
                        .decorate_with_output_samples()
                    output_sample = process.output_samples[0]
                elif parent_process_record and parent_process_record['output_sample']:
                    input_sample = parent_process_record['output_sample']
                    process.add_input_samples_to_process([input_sample])
                process = process.decorate_with_input_samples()
                process = process.decorate_with_output_samples()
                process_record = {
                    'key': row_key,
                    'process': process,
                    'output_sample': output_sample
                }
                self._sweep_for_process_value(
                    row_index, process,
                    start_col_index, end_col_index,
                    start_attribute_row_index)
                self._sweep_for_process_files(
                    row_index, process,
                    start_col_index, end_col_index,
                    start_attribute_row_index)

            self.metadata.update_process_metadata_end_row(row_index + 1)
            self.previous_row_key = row_key
            self.previous_parent_process = None
            if parent_process_record:
                self.previous_parent_process = parent_process_record['process']
            process = process_record['process']
            if process.category == 'create_sample' or process.does_transform:
                self.parent_process_list[process_index] = process_record

    def _sweep_for_process_value(self, data_row, process, start_col, end_col, start_attr_row):
        self._clear_params_and_measurement()
        # self.log.debug(process.name, start_col, end_col)
        for col in range(start_col, end_col):
            process_value_type = self.etl_source_data[start_attr_row][col]
            signature = self.etl_source_data[start_attr_row + 1][col]
            # self.log.debug(process.name, col, process_value_type, signature)
            if process_value_type == 'PARAM' or process_value_type == 'MEAS':
                value = self.etl_source_data[data_row][col]
                self._collect_params_and_measurement(process_value_type, value, signature)
        self._set_params_and_measurement(process)
        # self.log.debug(process.name, self.process_values)

    def _sweep_for_process_files(self, data_row, process, start_col, end_col, start_attr_row):
        # NOTE: only one FILES entry, per process, first one will dominate
        for col in range(start_col, end_col):
            process_value_type = self.etl_source_data[start_attr_row][col]
            if process_value_type == 'FILES':
                files = self.etl_source_data[data_row][col]
                self.metadata.update_process_files_list(files)
                if self.suppress_data_upload:
                    self.log.debug("data file upload suppressed: ", process.name, " - ", files)
                    break
                self._add_files(process, files)
                break

    def _clear_params_and_measurement(self):
        self.process_values = {
            "PARAM": {},
            "MEAS": {}
        }

    def _collect_params_and_measurement(self, values_type, value, signature):
        unit = None
        index = signature.find('(')
        if index > -1:
            end = signature.find(')')
            if end > -1 and end > index:
                unit = signature[index + 1:end]
            signature = signature[:index]
        signature = signature.strip()
        parts = signature.split('.')
        entry = self.process_values[values_type]
        name = parts[0]
        attribute = normalise_property_name(name)
        if attribute not in entry:
            entry[attribute] = {"value": None, "unit": unit, "name": name}
        if attribute == "composition":
            if not entry[attribute]["value"]:
                entry[attribute]["value"] = []
            value_entry = entry[attribute]["value"]
            element = parts[1]
            target = None
            for el_entry in value_entry:
                if el_entry["element"] == element:
                    target = el_entry
            if not target:
                target = {"element": element, "value": None}
                value_entry.append(target)
            target["value"] = self._value_or_stats(target["value"], parts[2:], value)
        else:
            entry[attribute]["value"] = self._value_or_stats(entry[attribute]["value"], parts[1:], value)

    @staticmethod
    def _value_or_stats(current_entry, header_parts, value):
        if not header_parts:
            return value
        else:  # case = collecting stats entry - header_parts[0] == stats or mean or stddev
            stats_label = header_parts[0]
            if stats_label == 'stats':
                stats_label = header_parts[1]
            if not current_entry:
                current_entry = {}
            current_entry[stats_label] = value
            return current_entry

    def _sweep_for_sample_name(self, row_index, start_attr_row, start_col, end_col):
        sample_name = None
        for col in range(start_col, end_col):
            process_value_type = self.etl_source_data[start_attr_row][col]
            if process_value_type == 'SAMPLES':
                sample_name = self.etl_source_data[row_index][col]
                # self.log.debug("Sample name", sample_name)
        return sample_name

    def _set_params_and_measurement(self, process):

        # parameters
        known_param_keys = []
        unknown_param_entries = []
        for key in self.process_values["PARAM"]:
            entry = self.process_values["PARAM"][key]
            # self.log.info("Param key = {}".format(key))
            # self.log.info("PARMA process = {}, key = {}, entry = {}, ({})".format(
            #    process.name, key, entry, process.is_known_setup_property(key)))
            if process.is_known_setup_property(key):
                if entry['value'] is not None:
                    process.set_value_of_setup_property(key, entry['value'])
                    if entry['unit']:
                        # table =
                        process.get_setup_properties_as_dictionary()
                        # self.log.info("unit check", entry['unit'], table[key].name, table[key].unit)
                        process.set_unit_of_setup_property(key, entry['unit'])
                    known_param_keys.append(key)
            else:
                entry['attribute'] = key
                # self.log.info("unknown_param entry = {}".format(entry))
                unknown_param_entries.append(entry)
        # self.log.info("known_param_keys = {}".format(known_param_keys))
        # self.log.info("unknown_param_entries = {}".format(unknown_param_entries))
        if known_param_keys:
            process.update_setup_properties(known_param_keys)
        if unknown_param_entries:
            process.update_additional_setup_properties(unknown_param_entries)
        # for elem in process.setup:
        #     attribute = elem.input_data['attribute']
        #     for prop in elem.properties:
        #         if prop.value:
        #             self.log.debug("Setup Results: ", attribute, prop.name, prop.value, prop.unit)

        # measurements
        for key in self.process_values["MEAS"]:
            # self.log.debug("MEAS", process.name, key)
            entry = self.process_values["MEAS"][key]
            if entry['value'] is not None:
                measurement_data = {
                    "name": _name_for_attribute(key),
                    "attribute": key,
                    "otype": _otype_for_attribute(key),
                    "value": entry['value'],
                    "is_best_measure": True
                }
                if entry['unit']:
                    measurement_data['unit'] = entry['unit']
                else:
                    measurement_data['unit'] = ""
                measurement = process.create_measurement(data=measurement_data)
                if measurement and measurement.id:
                    message = "measurement: id = " + measurement.id
                    if measurement.attribute:
                        message += ", attribute = " + measurement.attribute
                    else:
                        message += ", attribute = None"
                    if measurement.value:
                        message += ", value = " + str(measurement.value)
                    else:
                        message += ", value = None"
                    if measurement.unit:
                        message += ", unit = " + str(measurement.unit)
                    else:
                        message += ", unit = None"
                    self.log.debug(message)
                measurement_property = {
                    "name": _name_for_attribute(key),
                    "attribute": key
                }
                process.set_measurements_for_process_samples(measurement_property, [measurement])

    def _get_project_directory_from_path(self, path):
        if not path:
            return None
        directory = self.project.get_top_directory()
        self.log.debug("_get_project_directory_from_path: path = {}".format(path))
        if path.startswith('/'):
            path = path[1:]
        self.log.debug("_get_project_directory_from_path: path = {}".format(path))
        for part in path.split('/'):
            probe = None
            for child in directory.get_children():
                if child.name == part:
                    probe = child
                    break
            if probe:
                directory = probe
            else:
                return None
        return directory

    def _add_files(self, process, files_from_sheet):
        if not files_from_sheet:
            return
        if not self.data_directory:
            return
        process_data_path_list = [x.strip() for x in files_from_sheet.split(',')]
        self.log.debug("add files to process: {} ({})".format(process.name, process.id))
        self.log.debug("process_data_path_list = {}".format(process_data_path_list))
        process_files = []
        for path in process_data_path_list:
            path_list = path.split('/')
            process_files += self._all_files_in_data_directory_path(self.data_directory, path_list)
        if len(process_files) > 0:
            self.log.debug("for process {}({}) adding files {}".
                          format(process.name, process.id, [x.name for x in process_files]))
            self.log.debug("  file id's {}".
                          format([[x.name, x.id] for x in process_files]))
            process.add_files(process_files)
            samples = process.output_samples
            if not process.does_transform:
                samples = process.input_samples
            for sample in samples:
                sample.link_files(process_files)

    def _set_etl_source_date_from_path(self, project, spread_sheet_path):
        # Note: passing in project to facilitate partial testing
        server_side_file = self._server_side_file_path_for_project_path(project, spread_sheet_path)
        # create link dir (if needed) and link
        uuid = DatabaseInterface().get_uuid()
        mcdir = os.environ['MCDIR'].split(':')[0]
        link_base_path = os.path.join(mcdir, 'ExcelFileLinks')
        file_name = "{}.xlsx".format(uuid)
        link_path = os.path.join(link_base_path, file_name)
        os.link(server_side_file, link_path)
        # read data
        # noinspection PyBroadException
        try:
            excel_io_controller = ExcelIO()
            excel_io_controller.read_workbook(link_path)
            sheet_name_list = excel_io_controller.sheet_name_list()
            sheet_name = sheet_name_list[0]
            self.log.debug("In Excel file, using sheet '" +
                           sheet_name +
                           "' from sheets: [" + ", ".join(sheet_name_list) + "]")
            excel_io_controller.set_current_worksheet_by_index(0)
            self.etl_source_data = excel_io_controller.read_entire_data_from_current_sheet()
            excel_io_controller.close()
        except BaseException as e:
            self.log.exception("Reading failed: {}".format(e))
        # remove link
        os.unlink(link_path)

    def _create_base_experiment(self):
        experiment_list = self.project.get_all_experiments()
        existing_experiment = None
        for exp in experiment_list:
            if exp.name == self.experiment_name:
                existing_experiment = exp
        if existing_experiment:
            name = _unique_shadow_name(self.experiment_name, experiment_list)
            self.log.debug("Existing experiment with duplicate name. Renamed: " +
                           existing_experiment.name + " --> " + name)
            existing_experiment.rename(name)
        self.experiment = self.project.create_experiment(self.experiment_name, self.experiment_description)
        self.metadata.set_experiment_id(self.experiment.id)

    def _get_source_file_dir_list(self):
        row = self.metadata.start_attribute_row
        ret_list = []
        data_row_start = self.metadata.data_row_start
        data_row_end = self.metadata.data_row_end
        for col in range(1, self.metadata.data_col_end):
            attribute_type = self.etl_source_data[row][col]
            if attribute_type == "FILES":
                for data_row in range(data_row_start, data_row_end):
                    entry = self.etl_source_data[data_row][col]
                    if entry:
                        ret_list += [x.strip() for x in entry.split(',')]
        return ret_list

    def _scan_for_process_descriptions(self):
        # self.log.info("_scan_for_process_descriptions: {}, {}".format(self.start_sweep_col, self.end_sweep_col))
        name_row = None
        row_index = 0
        while row_index < len(self.etl_source_data) and not self.etl_source_data[row_index][0] == "BEGIN_DATA":
            if self.etl_source_data[row_index][0] == "NAME":
                name_row = row_index
                break
            row_index += 1
        col_index = self.start_sweep_col
        process_list = []
        previous_process = None
        while col_index < self.end_sweep_col:
            process_entry = self.etl_source_data[0][col_index]
            if process_entry and str(process_entry).startswith("PROC:"):
                if previous_process:
                    previous_process['end_col'] = col_index
                    process_list.append(previous_process)
                    previous_process = None
                process_entry = self._prune_entry(process_entry, "PROC:")
                process_name = process_entry
                if name_row and self.etl_source_data[name_row][col_index]:
                    process_name = self.etl_source_data[name_row][col_index]
                template_id = self._get_template_id_for(process_entry)
                self.log.info("Template match for process: name = {} template_id = {}"
                              .format(process_name, template_id))
                if template_id:
                    previous_process = {
                        'name': process_name,
                        'start_col': col_index,
                        'template': template_id
                    }
                else:
                    self.log.debug("process entry has no corresponding template:", process_entry)
            col_index += 1
        if previous_process:
            previous_process['end_col'] = col_index
            process_list.append(previous_process)
        return process_list

    def _determine_start_attribute_row(self, start_col_index):
        start_attribute_row_index = 2
        for row in range(1, self.header_end_row):
            entry = self.etl_source_data[row][start_col_index]
            if not entry:
                continue
            if entry.startswith('DUPLICATES_ARE_IDENTICAL'):
                pass
            #     self.log.debug("Encountered 'DUPLICATES_ARE_IDENTICAL' - ignored as this is the default behavior")
            if entry.startswith('ATTR_'):
                pass
            #     self.log.debug("Encountered '" + entry + "' - ignored, not implemented")
            if entry.startswith("NOTE") \
                    or entry.startswith("NO_UPLOAD") \
                    or entry.startswith("MEAS") \
                    or entry.startswith("PARAM") \
                    or entry.startswith("PROBLEM") \
                    or entry.startswith("SAMPLES") \
                    or entry.startswith("FILES"):
                start_attribute_row_index = row
        self.metadata.set_start_attribute_row(start_attribute_row_index)
        return start_attribute_row_index

    def _start_new_process(self, row_key, parent_process):
        if parent_process and self.previous_parent_process \
                and parent_process.id != self.previous_parent_process.id:
            return True
        return row_key != self.previous_row_key

    def _all_files_in_data_directory_path(self, directory, path_list):
        if len(path_list) == 0:
            return self._get_all_files_in_directory(directory)
        file_return_list = []
        for part in path_list:
            for child in directory.get_children():
                if child.name == part:
                    if type(child) is FileRecord:
                        file_return_list.append(child)
                    else:
                        file_return_list += self._all_files_in_data_directory_path(child, path_list[1:])
        return file_return_list

    def _get_all_files_in_directory(self, directory):
        file_list = []
        child_list = directory.get_children()
        for child in child_list:
            if type(child) is FileRecord:
                file_list.append(child)
            else:
                file_list += self._get_all_files_in_directory(child)
        return file_list

    @staticmethod
    def _prune_entry(entry, prefix):
        entry = str(entry)
        if entry.startswith(prefix):
            entry = entry[len(prefix):].strip(" ").strip("'").strip('"')
        else:
            entry = None
        return entry

    def _set_row_positions(self):
        self.header_end_row = 0
        self.data_start_row = 0
        index = 0
        for row in self.etl_source_data:
            if len(row) > 0 and row[0] and row[0].startswith("BEGIN_DATA"):
                self.data_start_row = index
                break
            index += 1
        if self.data_start_row == 0:
            return
        index = 0
        for row in self.etl_source_data:
            if len(row) > 0 and row[0] \
                    and (row[0].startswith("BEGIN_DATA") or row[0].startswith("COL_LABEL")):
                self.header_end_row = index
                break
            index += 1
        self.metadata.set_header_row_end(self.header_end_row)
        self.metadata.set_data_row_start(self.data_start_row)
        self.metadata.set_data_row_end(len(self.etl_source_data))

    def _set_col_positions(self):
        self.start_sweep_col = 1
        self.end_sweep_col = 0
        first_row = self.etl_source_data[0]
        index = 0
        missing_end = True
        for col in first_row:
            if str(col).startswith("END"):
                self.log.debug("Found END marker at column " + str(index) +
                               ", updating data end to this location")
                self.end_sweep_col = index
                missing_end = False
                break
            index += 1
        if missing_end:
            self.end_sweep_col = index
        self.metadata.set_data_col_start(self.start_sweep_col)
        self.metadata.set_data_col_end(self.end_sweep_col)

    def _record_header_rows(self):
        header = []
        for row in range(0, self.data_start_row):
            header_row = []
            for col in range(0, self.end_sweep_col):
                header_row.append(self.etl_source_data[row][col])
            header.append(header_row)
        self.metadata.record_header(header)

    def _row_key(self, row_index, start_col_index, end_col_index):
        row_key = None
        for col in range(start_col_index, end_col_index):
            probe = self.etl_source_data[row_index][col]
            # Note: what to except 0.0 as true, hence (probe == None)
            empty_probe = (probe is None)
            if not empty_probe and row_key:
                row_key += " -- " + str(probe)
            elif not empty_probe:
                row_key = str(probe)
        return row_key

    def _make_template_table(self):
        template_list = get_all_templates(apikey=self.apikey)
        table = {}
        for template in template_list:
            self.log.debug("Init Template entry for {}".format(template.id))
            table[template.id] = template
        self.template_table = table

    def _get_template_id_for(self, match):
        found_id = None
        match = "global_" + match
        for key in self.template_table:
            if match == key:
                found_id = key
        return found_id

    def _server_side_file_path_for_project_path(self, project, project_path):
        # Note: passing in project to facilitate partial testing
        top_directory = project.get_top_directory()
        if project_path.startswith('/'):
            project_path = project_path[1:]
        self.log.debug("Finding file for path {}".format(project_path))
        file = self._find_file_in_dir(top_directory, project_path.split('/'))
        mc_dirs_base = os.environ['MCDIR']
        internal_file_path = None
        if mc_dirs_base:
            mc_dirs = mc_dirs_base.split(":")
            for mc_dir in mc_dirs:
                if os.path.exists(mc_dir):
                    probe = self._internal_file_path_from_file_record(file)
                    probe = os.path.join(mc_dir, probe)
                    if os.path.exists(probe):
                        internal_file_path = probe
                        break
        return internal_file_path

    def _find_file_in_dir(self, directory, path_list):
        self.log.debug("path_list = {}".format(path_list))
        if not path_list:
            return None
        name = path_list[0]
        for file_or_dir in directory.get_children():
            if file_or_dir.name == name:
                path_list = path_list[1:]
                if len(path_list) > 0 and file_or_dir.otype == 'directory':
                    return self._find_file_in_dir(file_or_dir, path_list)
                elif len(path_list) == 0:
                    return file_or_dir
        return None

    @staticmethod
    def _internal_file_path_from_file_record(file):
        file_id = file.id
        if file.usesid:
            file_id = file.usesid
        file_path = "{}/{}/{}".format(file_id[9:11], file_id[11:13], file_id)
        return file_path


def _unique_shadow_name(original_name, experiment_list):
    count = 1
    trial_name = None
    while not trial_name:
        trial_name = original_name + " - " + str(count)
        count += 1
        for exp in experiment_list:
            if trial_name == exp.name:
                trial_name = None
    return trial_name


def _name_for_attribute(attribute):
    if attribute == "composition":
        return "Composition"
    if attribute == "thickness":
        return "Thickness"
    # self.log.debug("XXXXX __name_for_attribute", attribute, "defaults to", attribute)
    return attribute


def _otype_for_attribute(attribute):
    if attribute == "composition":
        return "composition"
    if attribute == "thickness":
        return "number"
    if attribute == "Condition Name":
        return "string"
    # self.log.debug("XXXXX __otype_for_attribute", attribute, "defaults to string")
    return "string"


def _verify_data_dir(dir_path):
    path = Path(dir_path)
    ok = path.exists() and path.is_dir()
    return ok


def _verify_input_path(input_path):
    path = Path(input_path)
    ok = path.exists() and path.is_file()
    return ok
