import React from 'react';
import {Grid, Menu, Segment} from 'semantic-ui-react';

export default class Experiment extends React.Component {
    state = { activeTab: 'details'};

    handleTabClick = (e, {name}) => this.setState({activeTab: name});

    render() {
        const {activeTab} = this.state;
        return (
            <Grid>
                <Grid.Column width={2}>
                    <Menu fluid vertical tabular>
                        <Menu.Item name='details' active={activeTab === 'details'} onClick={this.handleTabClick}/>
                        <Menu.Item name='workflow' active={activeTab === 'workflow'} onClick={this.handleTabClick}/>
                        <Menu.Item name='tasks' active={activeTab === 'tasks'} onClick={this.handleTabClick}/>
                        <Menu.Item name='notes' active={activeTab === 'notes'} onClick={this.handleTabClick}/>
                        <Menu.Item name='datasets' active={activeTab === 'datasets'} onClick={this.handleTabClick}/>
                        <Menu.Item name='samples' active={activeTab === 'samples'} onClick={this.handleTabClick}/>
                        <Menu.Item name='files' active={activeTab === 'files'} onClick={this.handleTabClick}/>
                    </Menu>
                </Grid.Column>
                <Grid.Column stretched width={14}>
                    <Segment>
                        Tab {activeTab}
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}