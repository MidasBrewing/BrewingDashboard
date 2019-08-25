import React from "react";

import { withAuthorization } from "../Session";
import Fermentation from "../Fermentation";
import Device from "../Device";

const DashboardPage = () => (
  <div>
    <h1>The Dashboard</h1>
    <Device />
    <Fermentation batch="A" />
  </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(DashboardPage);
