class FaktoryStatus:
    def __init__(self, status_json):
        self.source = status_json
        self.faktory = self.make_faktory_entry()
        self.server = self.make_server_entry()
        self.server_utc_time = status_json['server_utc_time']

    def make_faktory_entry(self):
        ret = None
        if 'faktory' not in self.source:
            return ret
        return FaktoryStatusFaktoryEntry(self.source['faktory'])

    def make_server_entry(self):
        ret = None
        if 'server' not in self.source:
            return ret
        return FaktoryStatusServerEntry(self.source['server'])


class FaktoryStatusFaktoryEntry:
    def __init__(self, source):
        self.source = source
        self.tasks = []
        self.total_enqueued = source['total_enqueued']
        self.total_failures = source['total_failures']
        self.total_processed = source['total_processed']
        self.total_queues = source['total_queues']
        self.backup_task_count = source['tasks']['backup']['count']
        if "tasks" in source:
            for task_type in source["tasks"]:
                task_entry = None
                if task_type in ('Dead', 'Retries', 'Scheduled'):
                    task_entry = FaktoryStatusCycleTaskTypeEntry(task_type, source['tasks'][task_type])
                elif task_type in ('Busy','Workers'):
                    task_entry = FaktoryStatusSimpleTaskTypeEntry(task_type, source['tasks'][task_type])
                if task_entry:
                    self.tasks.append(task_entry)


class FaktoryStatusCycleTaskTypeEntry:
    def __init__(self, source_type, source):
        self.source = source
        self.main_type = 'cycle'
        self.element_type = source_type
        self.cycles = source['cycles']
        self.enqueued = source['enqueued']
        self.size = source['size']
        self.wall_time_sec = source['wall_time_sec']


class FaktoryStatusSimpleTaskTypeEntry:
    def __init__(self, source_type, source):
        self.source = source
        self.main_type = 'simple'
        self.element_type = source_type
        self.size = source['size']
        self.reaped = source['reaped']


class FaktoryStatusServerEntry:
    def __init__(self, source):
        self.source = source
        self.command_count = self.source['command_count']
        self.connections = self.source['connections']
        self.faktory_version = self.source['faktory_version']
        self.uptime = self.source['uptime']
        self.used_memory_mb = self.source['used_memory_mb']