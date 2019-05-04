import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

class Device extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            devices: {},
        };

        this.loadDevices = this.loadDevices.bind(this);
    }

    loadDevices() {
        this.setState({ loading: true });

        this.props.firebase.devices().on('value', snapshot => {
            const devices = snapshot.val();

            this.setState({
                devices: (devices || {}),
                loading: false,
            });
        });
    }

    componentDidMount() {
        this.loadDevices();
    }

    render() {
        const { devices, loading } = this.state;
        const devicesPart = Object.keys(devices).map((device) => {
            const deviceData = devices[device];
            const up = deviceData.Up;
            const upAt = up && new Date(up.time);
            const ping = deviceData.Ping;
            const pingAt = ping && new Date(ping.time);
            const down = deviceData.Down;
            const downAt = down && new Date(down.time);

            const isUp = (upAt && downAt && upAt > downAt) || (upAt && !downAt);
            const lastPing = pingAt || upAt || downAt;

            return (
                <div>
                    Device: { device } is { isUp ? 'UP' : 'DOWN' } last ping at { lastPing && lastPing.toISOString() }
                </div>
            );
        });

        return (
            <div>
                <h3>Devices</h3>

                {loading && <div>Loading ...</div>}

                {devicesPart}
            </div>
        );
    }
}

export default withFirebase(Device);