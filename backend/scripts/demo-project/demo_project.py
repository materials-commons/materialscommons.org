from materials_commons.api import create_project, get_all_templates
from materials_commons.api import get_all_projects


class DemoProject:
    def __init__(self, data_directory_path):
        self.build_data_directory = data_directory_path
        self.project_name = "Demo Project"

    def does_project_exist(self):
        projects = get_all_projects()
        project = None
        for p in projects:
            if p.name == self.project_name:
                project = p
        return not not project

    def get_existing_project(self):
        projects = get_all_projects()
        project = None
        for p in projects:
            if p.name == self.project_name:
                project = p
        return project

    def build_project(self):
        project_name = self.project_name
        project_description = "A project for trying things out."
        experiment_name = "Demo: Microsegregation in HPDC L380"
        experiment_description = "A demo experiment -  A study of microsegregation in High Pressure Die Cast L380."

        project = \
            self._get_or_create_project(project_name, project_description)
        experiment = \
            self._get_or_create_experiment(project, experiment_name, experiment_description)

        template_table = self._make_template_table()
        processes_data = [
            {
                'name': 'Lift 380 Casting Day  # 1',
                'template': self._template_id_with(template_table, 'Create Samples')
            },
            {
                'name': 'Casting L124',
                'template': self._template_id_with(template_table, 'Sectioning')
            },
            {
                'name': 'Sectioning of Casting L124',
                'template': self._template_id_with(template_table, 'Sectioning')
            },
            {
                'name': 'EBSD SEM Data Collection - 5 mm plate',
                'template': self._template_id_with(template_table, 'EBSD SEM')
            },
            {
                'name': 'EPMA Data Collection - 5 mm plate - center',
                'template': self._template_id_with(template_table, 'EPMA')
            }
        ]

        processes = []
        for entry in processes_data:
            process_name = entry['name']
            template = entry['template']
            process = self._get_or_create_process(experiment, process_name, template)
            processes.append(process)

        sample_names = [
            'l380', 'L124', 'L124 - 2mm plate', 'L124 - 3mm plate',
            'L124 - 5mm plate', 'L124 - 5mm plate - 3ST', 'L124 - tensil bar, gage'
        ]

        samples = []
        samples = samples + \
            self._get_or_create_output_sample_from_process(
                processes[0], sample_names[0:1]
            )
        samples = samples + \
            self._get_or_create_output_sample_from_process(
                processes[1], sample_names[1:2]
            )

        samples = samples + \
            self._get_or_create_output_sample_from_process(
                processes[2], sample_names[2:]
            )

        processes[1] = processes[1].add_input_samples_to_process(samples[0:1])
        processes[2] = processes[2].add_input_samples_to_process(samples[1:2])
        processes[3] = processes[3].add_input_samples_to_process(samples[4:5])
        processes[4] = processes[4].add_input_samples_to_process(samples[4:5])

        count = 0
        for process in processes:
            processes[count] = experiment.get_process_by_id(process.id)
            count = count + 1

        processes[0] = self._setup_for_node(0, processes[0])
        processes[3] = self._setup_for_node(3, processes[3])
        processes[4] = self._setup_for_node(4, processes[4])

        filename_list = [
            'LIFT Specimen Die.jpg',
            'L124_photo.jpg',
            'LIFT HPDC Samplesv3.xlsx',
            'Measured Compositions_EzCast_Lift380.pptx',
            'GSD_Results_L124_MC.xlsx',
            'Grain_Size_EBSD_L380_comp_5mm.tiff',
            'Grain_Size_EBSD_L380_comp_core.tiff',
            'Grain_Size_EBSD_L380_comp_skin.tiff',
            'Grain_Size_Vs_Distance.tiff',
            'L124_plate_5mm_TT_GF2.txt',
            'L124_plate_5mm_TT_IPF.tif',
            'EPMA_Analysis_L124_Al.tiff',
            'EPMA_Analysis_L124_Cu.tiff',
            'EPMA_Analysis_L124_Si.tiff',
            'ExperimentData_Lift380_L124_20161227.docx',
            'Samples_Lift380_L124_20161227.xlsx'
        ]

        process_file_list = [
            [0, 2, 3], [0, 1], [1], [4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15]
        ]

        project_directory_path = "/FilesForSample"
        file_list = []
        for filename in filename_list:
            filepath_for_sample = self.build_data_directory + "/" + filename
            sample_file = self._get_file_from_project(project, project_directory_path, filename)
            if not sample_file:
                sample_file = project.add_file_using_directory(
                    project.add_directory(project_directory_path),
                    filename,
                    filepath_for_sample
                )
            file_list.append(sample_file)

        count = 0
        for process in processes:
            updated_process = experiment.get_process_by_id(process.id)
            files = updated_process.get_all_files()
            updated_process.files = files
            processes[count] = updated_process
            count = count + 1

        process_index = 0
        for file_index_list in process_file_list:
            for file_index in file_index_list:
                sample_file = file_list[file_index]
                if not self._process_has_file(processes[process_index], sample_file):
                    processes[process_index].add_files([sample_file])
                    updated_process = experiment.get_process_by_id(processes[process_index].id)
                    files = updated_process.get_all_files()
                    updated_process.files = files
                    processes[process_index] = updated_process
            process_index += 1

        measurement_data = {
            "name": "Composition",
            "attribute": "composition",
            "otype": "composition",
            "unit": "at%",
            "value": [
                {"element": "Al", "value": 94},
                {"element": "Ca", "value": 1},
                {"element": "Zr", "value": 5}],
            "is_best_measure": True
        }
        measurement = processes[0].create_measurement(data=measurement_data)
        measurement_property = {
            "name": "Composition",
            "attribute": "composition"
        }
        processes[0].set_measurements_for_process_samples(
            measurement_property, [measurement])

        return project

    # Support methods

    @staticmethod
    def _make_template_table():
        template_list = get_all_templates()
        table = {}
        for template in template_list:
            table[template.id] = template
        return table

    @staticmethod
    def _template_id_with(table, match):
        found_id = None
        for key in table:
            if match in key:
                found_id = key
        return found_id

    @staticmethod
    def _get_or_create_project(project_name, project_description):
        projects = get_all_projects()
        project = None
        for p in projects:
            if p.name == project_name:
                project = p
        if not project:
            project = create_project(
                name=project_name,
                description=project_description)
        return project

    @staticmethod
    def _get_or_create_experiment(project, experiment_name, experiment_description):
        experiments = project.get_all_experiments()
        experiment = None
        for ex in experiments:
            if ex.name == experiment_name:
                experiment = ex
        if not experiment:
            experiment = project.create_experiment(
                name=experiment_name,
                description=experiment_description)
        return experiment

    @staticmethod
    def _get_or_create_process(experiment, process_name, template_id):
        experiment = experiment.decorate_with_processes()
        processes = experiment.processes
        selected_process = None
        for process in processes:
            if template_id == process.template_id and process_name == process.name:
                selected_process = process
        process = selected_process
        if not process:
            process = experiment.create_process_from_template(template_id)
            process.rename(process_name)
        return process

    @staticmethod
    def _get_or_create_output_sample_from_process(process, sample_names):
        samples = process.output_samples
        selected_samples = []
        for sample in samples:
            if sample.name in sample_names:
                selected_samples.append(sample)
        samples = selected_samples
        if not samples:
            samples = process.create_samples(
                sample_names=sample_names
            )
        return samples

    @staticmethod
    def _setup_for_node(index, process):
        if index == 0:  # case: Create Sample: Lift 380 Casting Day #1
            date_value = 1485977519347  # February 1, 2017
            process.set_value_of_setup_property(
                'manufacturer', 'Ohio State University')
            process.set_value_of_setup_property('manufacturing_date', date_value)
            # process.set_value_of_setup_property('production_method', 'cast')
            process = process.update_setup_properties([
                'manufacturer', 'manufacturing_date'
                # ,'production_method'
            ])
            process = process.update_setup_properties([
                'manufacturer'
            ])
        if index == 3:  # case: EBSD SEM Data Collection - 5 mm plate
            process.set_value_of_setup_property('voltage', 31)
            process.set_unit_of_setup_property('voltage', 'kV')
            process.set_value_of_setup_property('sample_tilt', 70)
            process.set_value_of_setup_property('scan_size_width', 2500)
            process.set_value_of_setup_property('scan_size_height', 2500)
            process.set_value_of_setup_property('step_size', 1)
            process.set_value_of_setup_property('working_distance', 20)
            process = process.update_setup_properties([
                'voltage', 'sample_tilt', 'scan_size_width',
                'scan_size_height', 'step_size', 'working_distance'
            ])
        if index == 4:  # case: EPMA Data Collection - 5 mm plate - center
            process.set_value_of_setup_property('voltage', 15)
            process.set_unit_of_setup_property('voltage', 'kV')
            process.set_value_of_setup_property('beam_current', 20)
            process.set_unit_of_setup_property('beam_current', 'nA')
            process.set_value_of_setup_property('step_size', 10)
            process.set_value_of_setup_property('grid_dimensions', '20 x 20')
            process.set_value_of_setup_property('location', 'center, mid-thickness')
            process = process.update_setup_properties([
                'voltage', 'beam_current', 'step_size', 'grid_dimensions', 'location'
            ])
        return process

    @staticmethod
    def _get_file_from_project(project, directory_path, filename):
        directory_list = project.get_directory_list(directory_path)
        directory = directory_list[-1]
        if directory.shallow:
            directory = project.get_directory(directory.id)
        children = directory.get_children()
        selected_file = None
        for entry in children:
            if entry.otype == 'file' and entry.name == filename:
                selected_file = entry
        return selected_file

    @staticmethod
    def _process_has_file(process, file):
        selected_file = None
        for check_file in process.files:
            if check_file.id == file.id:
                selected_file = check_file
        return selected_file
