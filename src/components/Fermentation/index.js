import React, { Component, Button } from 'react';

import { withFirebase } from '../Firebase';

class Fermentation extends Component {
    constructor(props) {
        super(props);

        this.state = {
        loading: false,
        entries: [],
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.fermentations().on('value', snapshot => {
            const usersObject = snapshot.val();

            const usersList = Object.keys(usersObject).map(key => ({
                ...usersObject[key],
                uid: key,
            }));

            this.setState({
                entries: usersList,
                loading: false,
            });
        });
    }

    render() {
        const { entries, loading } = this.state;
        const { firebase } = this.props;
        const pings = 1;
        const lastPing = '' + new Date();
        const countLastHour = 5;

        return (
            <div>
                <h3>Fermentation</h3>

                {loading && <div>Loading ...</div>}

                <div>Bubbles the last hour: {countLastHour}</div>
                <div>Pings from MidasPie: {pings}</div>
                <div>Last ping at: {lastPing}</div>
                <button type="button" onClick={() => this.doResetFermentationEntires }>
                    Reset
                </button>      
            </div>
        );
    }

    doResetFermentationEntires() {
        
    }
}

export default withFirebase(Fermentation);