import argparse
import datetime
import os
import sys
from . import Path

from materials_commons.api import create_project, get_all_templates
from materials_commons.api import File as FileRecord
from .common.util import _normalise_property_name
from .common.worksheet_data import ExcelIO
from .common.metadata import Metadata


class BuildProjectExperiment:
    def __init__(self):
        self.description = "Project from excel spreadsheet"
        self.source = self.data_start_row = self.project = self.experiment = None
        self.data_start_row = self.data_path = None
        self.parent_process_list = None
        self.previous_row_key = None
        self.previous_parent_process = None
        self.metadata = Metadata()
        self.process_values = {}
        self.process_files = {}
        self.rename_duplicates = False
        self.data_path = None
        self.project = None
        self.experiment = None
        self.suppress_data_upload = False

        self._make_template_table()

    def set_data(self, data):
        self.source = data

    def set_input_information(self, spread_sheet_path, data_dir):
        self.data_path = data_dir
        self.metadata.set_input_information(spread_sheet_path, data_dir)

    def set_rename_is_ok(self, flag):
        self.rename_duplicates = flag

    def build(self, spread_sheet_path, data_path):
        excel_io_controller = ExcelIO()
        excel_io_controller.read_workbook(spread_sheet_path)
        sheet_name_list = excel_io_controller.sheet_name_list()
        sheet_name = excel_io_controller.set_current_worksheet_by_index(0)
        print("In Excel file, using sheet", sheet_name, "from sheets", sheet_name_list)
        self.set_data(excel_io_controller.read_entire_data_from_current_sheet())
        excel_io_controller.close()

        self.suppress_data_upload = not data_path

        description = "Project from excel spreadsheet: " + spread_sheet_path + \
                      "; data upload suppressed"
        if data_path:
            description = "Project from excel spreadsheet: " + spread_sheet_path + \
                "; using data from " + data_path

        self.set_project_description(description)

        self.set_input_information(spread_sheet_path, data_path)

        if not self._set_project_and_experiment():
            return

        if data_path:
            self.project.local_path = data_path

        self._set_row_positions()
        self._set_col_positions()

        self.sweep()

        self.write_metadata()

        print("Created project:", self.project.name, self.project.id)
        print("With Experiment", self.experiment.name, self.experiment.id)

    def write_metadata(self):
        print("Writing metadata for experiment '" + self.experiment.name + "'")
        self.metadata.write(self.experiment.id)

    def sweep(self):
        process_list = self._scan_for_process_descriptions()
        if len(process_list) == 0:
            print("No complete processes found in project")
        self.parent_process_list = []
        for index in range(self.data_start_row, len(self.source)):
            self.parent_process_list.append(None)
        self.previous_row_key = None
        self.previous_parent_process = None
        for proc_data in process_list:
            self.sweep_process(proc_data)

    def sweep_process(self, proc_data):
        start_col_index = proc_data['start_col']
        end_col_index = proc_data['end_col']
        template_id = proc_data['template']
        process_name = proc_data['name']
        print("Sweep for process: " + process_name + " (" + template_id + ")")
        start_attribute_row_index = self._determine_start_attribute_row(start_col_index)
        self._record_header_rows()
        process_record = None

        for row_index in range(self.data_start_row, len(self.source)):
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
                # print ("Start new process:", template_id, row_key)
                process = self.experiment.create_process_from_template(template_id)
                if not process.name == process_name:
                    process = process.rename(process_name)
                self.metadata.set_process_metadata(
                    row_index, start_col_index, end_col_index, template_id, process)
                output_sample = None
                if process.process_type == 'create':
                    sample_name = self.sweep_for_sample_name(
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
                self.sweep_for_process_value(
                    row_index, process,
                    start_col_index, end_col_index,
                    start_attribute_row_index)
                self.sweep_for_process_files(
                    row_index, process,
                    start_col_index, end_col_index,
                    start_attribute_row_index)

            self.metadata.update_process_metadata_end_row(row_index + 1)
            self.previous_row_key = row_key
            self.previous_parent_process = None
            if parent_process_record:
                self.previous_parent_process = parent_process_record['process']
            self.parent_process_list[process_index] = process_record

    def sweep_for_process_value(self, data_row, process, start_col, end_col, start_attr_row):
        self.clear_params_and_measurement()
        # print(process.name, start_col, end_col)
        for col in range(start_col, end_col):
            process_value_type = self.source[start_attr_row][col]
            signature = self.source[start_attr_row + 1][col]
            # print(process.name, col, process_value_type, signature)
            if process_value_type == 'PARAM' or process_value_type == 'MEAS':
                value = self.source[data_row][col]
                self.collect_params_and_measurement(process_value_type, value, signature)
        self.set_params_and_measurement(process)
        # print(process.name, self.process_values)

    def sweep_for_process_files(self, data_row, process, start_col, end_col, start_attr_row):
        # NOTE: only one FILES entry, per process, first one will dominate
        for col in range(start_col, end_col):
            process_value_type = self.source[start_attr_row][col]
            if process_value_type == 'FILES':
                files = self.source[data_row][col]
                self.metadata.update_process_files_list(files)
                if self.suppress_data_upload:
                    print("data file upload supressed: ", process.name, " - ", files)
                    break
                self.add_files(process, files)
                break

    def clear_params_and_measurement(self):
        self.process_values = {
            "PARAM": {},
            "MEAS": {}
        }

    def collect_params_and_measurement(self, values_type, value, signature):
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
        attribute = parts[0]
        attribute = _normalise_property_name(attribute)
        if attribute not in entry:
            entry[attribute] = {"value": None, "unit": unit}
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
            target["value"] = self.value_or_stats(target["value"], parts[2:], value)
        else:
            entry[attribute]["value"] = self.value_or_stats(entry[attribute]["value"], parts[1:], value)

    @staticmethod
    def value_or_stats(current_entry, header_parts, value):
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

    def sweep_for_sample_name(self, row_index, start_attr_row, start_col, end_col):
        sample_name = None
        for col in range(start_col, end_col):
            process_value_type = self.source[start_attr_row][col]
            if process_value_type == 'SAMPLES':
                sample_name = self.source[row_index][col]
                # print("Sample name", sample_name)
        return sample_name

    def set_params_and_measurement(self, process):
        # parameters
        known_param_keys = []
        unknown_param_entries = []
        for key in self.process_values["PARAM"]:
            entry = self.process_values["PARAM"][key]
            if process.is_known_setup_property(key):
                # print("PARMA", process.name, key, entry, process.is_known_setup_property(key))
                if entry['value'] is not None:
                    process.set_value_of_setup_property(key, entry['value'])
                    if entry['unit']:
                        # table =
                        process.get_setup_properties_as_dictionary()
                        # print("unit check", entry['unit'], table[key].name, table[key].unit)
                        process.set_unit_of_setup_property(key, entry['unit'])
                    known_param_keys.append(key)
            else:
                entry['attribute'] = key
                # print("Additional setup parameter:", entry)
                unknown_param_entries.append(entry)
        if known_param_keys:
            process.update_setup_properties(known_param_keys)
        if unknown_param_entries:
            process.update_additional_setup_properties(unknown_param_entries)
        # for elem in process.setup:
        #     attribute = elem.input_data['attribute']
        #     for prop in elem.properties:
        #         if prop.value:
        #             print("Setup Results: ", attribute, prop.name, prop.value, prop.unit)
        # measurements
        for key in self.process_values["MEAS"]:
            # print("MEAS", process.name, key)
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
                # print(" ++ measurement", measurement.id, measurement.attribute, measurement.value, measurement.unit)
                measurement_property = {
                    "name": _name_for_attribute(key),
                    "attribute": key
                }
                process.set_measurements_for_process_samples(measurement_property, [measurement])

    def add_files(self, process, files_from_sheet):
        if not files_from_sheet:
            return
        file_or_dir_list = [x.strip() for x in files_from_sheet.split(',')]
        file_list = []
        dir_list = []
        process_files = []
        for entry in file_or_dir_list:
            path = Path(self.project.local_path) / entry
            if path.is_dir():
                dir_list.append(str(path.absolute()))
            elif path.is_file():
                file_list.append(str(path.absolute()))
            else:
                print("  Requested path for data not in user data directory, ignoring:", path)
        for entry in file_list:
            process_files.append(self.project.add_file_by_local_path(entry))
        for entry in dir_list:
            self.project.add_directory_tree_by_local_path(entry)
            directory = self.project.get_by_local_path(entry)
            file_list = self._get_all_files_in_directory(directory)
            process_files += file_list
        process.add_files(process_files)

    def set_project_description(self, description):
        self.description = description

    # helper methods

    def _set_project_and_experiment(self):
        self._set_names()
        if self.project_name:
            print("Project name: ", self.project_name)
        else:
            print("No project name found; check format. Quiting.")
            return False

        if self.experiment_name:
            print("Experiment name:", self.experiment_name)
        else:
            print("No experiment name found; check format. Quiting.")
            return False

        self.project = create_project(self.project_name, self.description)

        experiment_list = self.project.get_all_experiments()
        existing_experiment = None
        for exp in experiment_list:
            if exp.name == self.experiment_name:
                existing_experiment = exp
        if existing_experiment:
            if self.rename_duplicates:
                name = _unique_shadow_name(self.experiment_name, experiment_list)
                print("Existing experiment with duplicate name. Renamed:",
                      existing_experiment.name, "-->", name)
                existing_experiment.rename(name)
            else:
                print("An experiment already exists with this name, " + self.experiment_name)
                print("And the --rename flag was not specified.")
                print("You can delete or rename the existing experiment.")
                print("Or specify the --rename flag in the command line arguments.")
                print("Quiting.")
                return False
        self.experiment = self.project.create_experiment(self.experiment_name, "")
        self.metadata.set_project_id(self.project.id)
        self.metadata.set_experiment_id(self.experiment.id)
        return True

    def _scan_for_process_descriptions(self):
        # print("_scan_for_process_descriptions", self.start_sweep_col, self.end_sweep_col)
        name_row = None
        row_index = 0
        while row_index < len(self.source) and not self.source[row_index][0] == "BEING_DATA":
            if self.source[row_index][0] == "NAME":
                name_row = row_index
                break
            row_index += 1
        col_index = self.start_sweep_col
        process_list = []
        previous_process = None
        while col_index < self.end_sweep_col:
            process_entry = self.source[0][col_index]
            if process_entry and str(process_entry).startswith("PROC:"):
                if previous_process:
                    previous_process['end_col'] = col_index
                    process_list.append(previous_process)
                    previous_process = None
                process_entry = self._prune_entry(process_entry, "PROC:")
                process_name = process_entry
                if name_row and self.source[name_row][col_index]:
                    process_name = self.source[name_row][col_index]
                template_id = self._get_template_id_for(process_entry)
                if template_id:
                    previous_process = {
                        'name': process_name,
                        'start_col': col_index,
                        'template': template_id
                    }
                else:
                    print("process entry has no corresponding template:", process_entry)
            col_index += 1
        if previous_process:
            previous_process['end_col'] = col_index
            process_list.append(previous_process)
        return process_list

    def _determine_start_attribute_row(self, start_col_index):
        start_attribute_row_index = 2
        for row in range(1, self.header_end_row):
            entry = str(self.source[row][start_col_index])
            if entry.startswith('DUPLICATES_ARE_IDENTICAL'):
                pass
            #     print("Encountered 'DUPLICATES_ARE_IDENTICAL' - ignored as this is the default behaivor")
            if entry.startswith('ATTR_'):
                pass
            #     print("Encountered '" + entry + "' - ignored, not implemented")
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

    def _set_names(self):
        self.project_name = self._prune_entry(self.source[0][0], "PROJ:")
        self.experiment_name = self._prune_entry(self.source[1][0], "EXP:")

    def _set_row_positions(self):
        self.header_end_row = 0
        self.data_start_row = 0
        index = 0
        for row in self.source:
            if len(row) > 0 and row[0] and row[0].startswith("BEGIN_DATA"):
                self.data_start_row = index
                break
            index += 1
        if self.data_start_row == 0:
            return
        index = 0
        for row in self.source:
            if len(row) > 0 and row[0] \
                    and (row[0].startswith("BEGIN_DATA") or row[0].startswith("COL_LABEL")):
                self.header_end_row = index
                break
            index += 1
        self.metadata.set_header_row_end(self.header_end_row)
        self.metadata.set_data_row_start(self.data_start_row)
        self.metadata.set_data_row_end(len(self.source))

    def _set_col_positions(self):
        self.start_sweep_col = 1
        self.end_sweep_col = 0
        first_row = self.source[0]
        index = 0
        missing_end = True
        for col in first_row:
            if str(col).startswith("END"):
                print("Found END marker at column " + str(index)
                      + ", updating data end to this location")
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
                header_row.append(self.source[row][col])
            header.append(header_row)
        self.metadata.record_header(header)

    def _row_key(self, row_index, start_col_index, end_col_index):
        row_key = None
        for col in range(start_col_index, end_col_index):
            probe = self.source[row_index][col]
            # Note: what to except 0.0 as true, hence (probe == None)
            empty_probe = (probe is None)
            if not empty_probe and row_key:
                row_key += " -- " + str(probe)
            elif not empty_probe:
                row_key = str(probe)
        return row_key

    def _make_template_table(self):
        template_list = get_all_templates()
        table = {}
        for template in template_list:
            table[template.id] = template
        self.template_table = table

    def _get_template_id_for(self, match):
        found_id = None
        for key in self.template_table:
            if match in key:
                found_id = key
        return found_id


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
    # print("XXXXX __name_for_attribute", attribute, "defaults to", attribute)
    return attribute


def _otype_for_attribute(attribute):
    if attribute == "composition":
        return "composition"
    if attribute == "thickness":
        return "number"
    if attribute == "Condition Name":
        return "string"
    # print("XXXXX __otype_for_attribute", attribute, "defaluts to string")
    return "string"


def _verify_data_dir(dir_path):
    path = Path(dir_path)
    ok = path.exists() and path.is_dir()
    return ok


def _verify_input_path(input_path):
    path = Path(input_path)
    ok = path.exists() and path.is_file()
    return ok


def main(spread_sheet_path, data_dir, rename_flag):
    if data_dir and (not _verify_data_dir(data_dir)):
        print("The Path to data file directory does not point to a user directory; exiting.")
        exit(-1)
    if not _verify_input_path(spread_sheet_path):
        print("The Path to the input Excel spreadsheet does not point to a file; exiting.")
        exit(-1)
    builder = BuildProjectExperiment()
    if rename_flag:
        builder.set_rename_is_ok(rename_flag)
    builder.build(spread_sheet_path, data_dir)


if __name__ == '__main__':
    time_stamp = '%s' % datetime.datetime.now()

    argv = sys.argv
    parser = argparse.ArgumentParser(
        description='Build a workflow from given (well formatted) Excel spreadsheet')
    parser.add_argument('input', type=str,
                        help='Path to input EXCEL file')
    parser.add_argument('--upload', type=str,
                        help='Path to directory of data files to upload - optional')
    parser.add_argument('--rename', action='store_true',
                        help='A flag that indicates that the experiment should be renamed when a name collision occurs')
    args = parser.parse_args(argv[1:])

    args.input = os.path.abspath(args.input)

    print("Path to input EXCEL file: " + args.input)
    if args.upload:
        args.upload = os.path.abspath(args.upload)
        print("Path to directory as sources of file upload: " + args.upload)
    else:
        print("Path to directory as sources of file upload, not specified. File upload suppressed")
    print("Flag indicating if there is a previous experiment with same name, it should be renamed: " + str(args.rename))

    main(args.input, args.upload, args.rename)
