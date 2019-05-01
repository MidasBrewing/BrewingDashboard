import React from 'react';

import { withAuthorization } from '../Session';
import Fermentation from '../Fermentation';

const DashboardPage = () => (
    <div>
        <h1>The Dashboard</h1>
        <p>The Dashboard Page is accessible by every signed in user.</p>
        <Fermentation batch="A"/>
        <Fermentation batch="B"/>
    </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(DashboardPage);