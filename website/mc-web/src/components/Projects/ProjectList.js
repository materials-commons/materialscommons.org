import React from 'react';
import {Table} from 'semantic-ui-react';

export default class ProjectsList extends React.Component {
    render() {
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
                    <Table.Row>
                        <Table.Cell>Demo Project</Table.Cell>
                        <Table.Cell>Glenn Tarcea</Table.Cell>
                        <Table.Cell>{'2/23/17'}</Table.Cell>
                        <Table.Cell>{'0'}</Table.Cell>
                        <Table.Cell>{'1'}</Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>My Project</Table.Cell>
                        <Table.Cell>Terry Weymouth</Table.Cell>
                        <Table.Cell>{'2/23/17'}</Table.Cell>
                        <Table.Cell>{'0'}</Table.Cell>
                        <Table.Cell>{'1'}</Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        )
    }
}
