import argparse
import sys

from materials_commons.api import get_all_projects


class Walker:

    def __init__(self):
        self.project = None
        self.experiment = None

    def set_up_project_experiment(self, apikey, project_name, experiment_name):
        project_list = get_all_projects(apikey=apikey)
        for proj in project_list:
            if proj.name == project_name:
                self.project = proj
        if not self.project:
            print("Can not find project with name = " + str(project_name) + ". Quiting.")
            return False
        experiment_list = self.project.get_all_experiments()
        found = []
        for exp in experiment_list:
            if exp.name == experiment_name:
                found.append(exp)
        if not found:
            print("Can not find Experiment with name = " + str(experiment_name) + ". Quiting.")
            return False
        if len(found) > 1:
            print("Found more the one Experiment with name = " + str(experiment_name) + ";")
            print("Rename experiment so that '" + str(experiment_name) + "' is unique.")
            print("Quiting.")
            return False
        self.experiment = found[0]
        return True

    def walk(self):
        experiment = self.experiment
        print("Walking", experiment.name, "of", experiment.project.name)
        processes = experiment.get_all_processes()
        process_table = self.make_process_dic(processes)
        roots = []
        # print(len(process_table))
        for process in processes:
            if not process.input_samples:
                roots.append(process)
                process_table.pop(process.id)
        front = []
        for proc in roots:
            self.push_on(front, proc)
        while front:
            # print("process remaining: ", len(front))
            proc = self.pop_from(front)
            # print("for proc", proc.name)
            children = self.all_child_nodes(proc, process_table)
            # print("children count:", len(children))
            proc.children = children
            for child in children:
                child.parent = proc
                process_table.pop(child.id)
                self.push_on(front, child)
        return roots

    # def unify_roots(self, roots):
    #     header_tree = roots[0]
    #     for proc in roots[1:]:
    #         header_tree = self.merge_into_tree(header_tree, proc)
    #     return header_tree
    #
    # def merge_into_tree(self, tree, proc):
    #     if not proc:
    #         return tree
    #     if not tree:
    #         return proc
    #     if tree.id == proc.id:
    #         self.merge_attributes_into(tree, proc)
    #     match_pair_list = self.find_match_in(tree, proc)
    #     if match_pair_list:
    #         self.merge_into_tree(match_pair_list[0], match_pair_list[1])
    #     else:
    #         pass

    # def merge_attributes_into(self, tree, proc):
    #     return tree
    #
    # def find_match_in(self, tree, proc):
    #     return tree

    def print_path(self, indent, proc):
        padding = ""
        for i in range(0, indent):
            padding += "  "
        print(padding, proc.name, proc.id)
        print(padding, self.process_samples_text(proc))
        print(padding, self.filename_list_text(proc))
        measurements = proc.measurements
        for m in measurements:
            header = "|- MEAS" + str("(*)" if m.is_best_measure else "")
            if isinstance(m.value, list):
                for el in m.value:
                    print(padding, header, m.attribute + "." + el['element'], el['value'], m.unit)
            else:
                print(padding, header, m.attribute, m.value, m.unit)
        setup_list = proc.setup
        for s in setup_list:
            for prop in s.properties:
                if prop.value:
                    print(padding, "|- PARAM", prop.attribute, prop.value, prop.unit)
        for child in proc.children:
            self.print_path(indent + 1, child)

    def all_child_nodes(self, proc, process_table):
        if not process_table:
            return []
        children = []
        for key in process_table:
            probe = process_table[key]
            if self.is_child(proc, probe):
                children.append(probe)
        return children

    @staticmethod
    def process_samples_text(process):
        text = "Samples: "
        samples = process.input_samples
        if samples:
            names = []
            for s in samples:
                names.append(s.name)
            text += '(' + ','.join(names) + ')'
        else:
            text += '()'
        text += ' --> '
        samples = process.output_samples
        if samples:
            names = []
            for s in samples:
                names.append(s.name)
            text += '(' + ','.join(names) + ')'
        else:
            text += '()'
        return text

    @staticmethod
    def filename_list_text(process):
        text = "Files: "
        files = process.get_all_files()
        if not files:
            return text + "(none)"
        names = []
        for file in files:
            names.append(file.name)
        text += ', '.join(names)
        return text

    @staticmethod
    def is_child(parent, candidate):
        for sample in parent.output_samples:
            for match in candidate.input_samples:
                if sample.id == match.id and sample.property_set_id == match.property_set_id:
                    return True
        return False

    @staticmethod
    def push_on(stack_list, obj):
        stack_list.append(obj)

    @staticmethod
    def pop_from(stack_list):
        obj = stack_list[len(stack_list) - 1]
        stack_list.remove(obj)
        return obj

    @staticmethod
    def make_process_dic(processes):
        table = {}
        for proc in processes:
            table[proc.id] = proc
        return table


def main(apikey, project_name, experiment_name):
    walker = Walker()
    ok = walker.set_up_project_experiment(apikey, project_name, experiment_name)
    if not ok:
        return
    roots = walker.walk()
    print("-----------------------------------------")
    print("|  Process-Workflow  trees (with data)  |")
    print("-----------------------------------------")
    print("Project: ", walker.project.name, "(" + walker.project.id + ")")
    print("Experiment: ", walker.experiment.name, "(" + walker.experiment.id + ")")
    for proc in roots:
        walker.print_path(0, proc)


if __name__ == '__main__':
    argv = sys.argv
    parser = argparse.ArgumentParser(
        description='Print out process-workflow, with data, for a named Project/Experiment')
    parser.add_argument('apikey', type=str, help="User's APIKEY")
    parser.add_argument('proj', type=str, help="Project Name")
    parser.add_argument('exp', type=str, help="Experiment Name")
    args = parser.parse_args(argv[1:])
    main(args.apikey, args.proj, args.exp)
