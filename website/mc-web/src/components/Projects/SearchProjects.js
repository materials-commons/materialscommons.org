import React from 'react';
import {Search} from 'semantic-ui-react';

export default class Projects extends React.Component {
    handleSearchChange = (e, data) => {
        this.props.onChange(data.value);
    };

    render() {
        return (
            <Search showNoResults={false} onSearchChange={this.handleSearchChange}/>
        )
    }
}
