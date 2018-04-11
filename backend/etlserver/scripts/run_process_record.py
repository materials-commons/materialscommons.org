from ..DatabaseInterface import DatabaseInterface


def print_status_record(status_record):
    print(status_record['birthtime'])
    print(status_record['mtime'])
    print(status_record['name'])
    print(status_record['description'])
    print(status_record['extras'])


def main():
    user_id = "test@test.mc"
    project_id = "3751239e-c0eb-4af2-ae33-a89d1911b968"
    status_record = DatabaseInterface().create_status_record(user_id, project_id, "ETL Process")
    print_status_record(status_record)
    status_record_id = status_record['id']
    status_record = DatabaseInterface().\
        add_extras_data_to_status_record(status_record_id,{"ping": "pong", "foo": "foo"})
    print_status_record(status_record)
    status_record = DatabaseInterface().\
        update_extras_data_on_status_record(status_record_id,{"foo": "bar", "bar": "foo"})
    print_status_record(status_record)
    status_record = DatabaseInterface(). \
        replace_extras_data_on_status_record(status_record_id,{"a": "b", "c": "d"})
    print_status_record(status_record)


if __name__ == "__main__":
    main()
