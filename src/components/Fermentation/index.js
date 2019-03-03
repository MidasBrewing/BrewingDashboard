import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

class Fermentation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            fermentations: [],
        };

        this.doResetFermentationEntires = this.doResetFermentationEntires.bind(this);
        this.loadFermentations = this.loadFermentations.bind(this);
    }

    loadFermentations() {
        this.setState({ loading: true });

        this.props.firebase.fermentations().on('value', snapshot => {
            const fermentations = snapshot.val();

            this.setState({
                fermentations: (fermentations ? Object.values(fermentations) : []),
                loading: false,
            });
        });
    }

    componentDidMount() {
        this.loadFermentations();
    }

    render() {
        const { fermentations, loading } = this.state;
        const pings = fermentations.length;
        const lastFermentation = fermentations[fermentations.length - 1];
        const lastPing = lastFermentation ? lastFermentation.at : "-";
        const now = new Date();
        const countLastHour = fermentations.reduce((accumulator, currentValue) => {
            const currentDate = new Date(currentValue.at);
            const hours = Math.abs(now - currentDate) / 36e5;

            console.log("now: " + now + " date: " + currentDate);
            console.log("hours: " + hours);

        /*if (now.getFullYear() === currentDate.getFullYear() && 
                now.getMonth() === currentDate.getMonth() &&
                now.getDay() === currentDate.getDay() &&
                now.getHours() === currentDate.getHours()) {
                return accumulator++;        */
            if (hours <= 1) {
                return accumulator + 1;      
            }
        
            return accumulator;
        }, 0);

        return (
            <div>
                <h3>Fermentation</h3>

                {loading && <div>Loading ...</div>}

                <div>Bubbles the last hour: {countLastHour}</div>
                <div>Pings from MidasPie: {pings}</div>
                <div>Last ping at: {lastPing}</div>
                <button type="button" onClick={ this.doResetFermentationEntires }>
                    Reset
                </button>      
            </div>
        );
    }

    doResetFermentationEntires() {
        this.props.firebase.fermentations().set({}); 
        this.setState({
            fermentations: [],
        });
    }
}

export default withFirebase(Fermentation);