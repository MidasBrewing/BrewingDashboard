import React from 'react';

import { withAuthorization } from '../Session';
import Fermentation from '../Fermentation';

const HomePage = () => (
    <div>
        <h1>The Dashboard</h1>
        <p>The Home Page is accessible by every signed in user.</p>
        <Fermentation />
    </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);