import React from 'react';
import {Table} from 'semantic-ui-react';
import moment from 'moment';
import {Link} from 'react-router-dom';

class ProjectReminders extends React.Component {
    render() {
        const reminders = this.props.reminders.map((r, i) => (<li key={r.id}>{r.note}</li>));
        return (
            <ul>
                {reminders}
            </ul>
        )
    }
}

class ProjectRowEntry extends React.Component {
    render() {
        const p = this.props.project;
        return (
            <Table.Row>
                <Table.Cell><Link to={`/project/${p.id}`}>{p.name}</Link></Table.Cell>
                <Table.Cell>{p.owner_details.fullname}</Table.Cell>
                <Table.Cell>{moment(p.mtime).format('DD/MM/YY')}</Table.Cell>
                <Table.Cell>{p.files}</Table.Cell>
                <Table.Cell>{p.users.length}</Table.Cell>
                <Table.Cell><ProjectReminders reminders={p.reminders}/></Table.Cell>
            </Table.Row>
        )
    }
}

export default class ProjectsList extends React.Component {
    render() {
        const projectRows = this.props.projects.map(p => (<ProjectRowEntry key={p.id} project={p}/>));
        return (
            <Table basic='very' selectable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Owner</Table.HeaderCell>
                        <Table.HeaderCell>Modified</Table.HeaderCell>
                        <Table.HeaderCell>F</Table.HeaderCell>
                        <Table.HeaderCell>U</Table.HeaderCell>
                        <Table.HeaderCell>Reminders</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {projectRows}
                </Table.Body>
            </Table>
        )
    }
}
