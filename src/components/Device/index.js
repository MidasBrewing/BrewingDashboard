import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { withFirebase } from "../Firebase";

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  icon: {
    margin: theme.spacing.unit * 2
  },
  card: {
    minWidth: 275
  },
  title: {
    fontSize: 20
  }
});

class Device extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      devices: {}
    };

    this.loadDevices = this.loadDevices.bind(this);
  }

  loadDevices() {
    this.setState({ loading: true });

    this.props.firebase.devices().on("value", snapshot => {
      const devices = snapshot.val();

      this.setState({
        devices: devices || {},
        loading: false
      });
    });
  }

  componentDidMount() {
    this.loadDevices();
  }

  textFromDevice(device) {
    switch (device) {
      case "fermentation":
        return "Bubble detection";
      default:
        return device;
    }
  }

  render() {
    const { devices, loading } = this.state;
    const { classes } = this.props;

    const devicesPart = Object.keys(devices).map(device => {
      const deviceData = devices[device];
      const up = deviceData.Up;
      const upAt = up && new Date(up.time);
      const ping = deviceData.Ping;
      const pingAt = ping && new Date(ping.time);
      const down = deviceData.Down;
      const downAt = down && new Date(down.time);
      const now = new Date();
      const text = this.textFromDevice(device);

      var biggest = {};
      if ((upAt && downAt && upAt > downAt) || (upAt && !downAt)) {
        biggest = { at: upAt, type: "up", ip: up.ip };
      }
      if (
        (downAt && biggest.at && downAt > biggest.at) ||
        (downAt && !biggest.at)
      ) {
        biggest = { at: downAt, type: "down", ip: down.ip };
      }
      if (
        (pingAt && biggest.at && pingAt > biggest.at) ||
        (pingAt && !biggest.at)
      ) {
        biggest = { at: pingAt, type: "ping", ip: ping.ip };
      }

      var isUp = false;

      const lastHour = new Date().setHours(now.getHours() - 1);
      if (
        (biggest.type === "up" || biggest.type === "ping") &&
        biggest.at >= lastHour
      ) {
        // not enough time for a ping
        isUp = true;
      }
      const ip = biggest.ip;

      return (
        <ListItem key={device}>
          <Avatar>
            {isUp ? (
              <ThumbUpIcon color="primary" />
            ) : (
              <ThumbDownIcon color="error" />
            )}
          </Avatar>
          <ListItemText primary={text} secondary={ip} />
        </ListItem>
      );
    });

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            Devices
          </Typography>
          <List className={classes.root}>{devicesPart}</List>
          <Typography component="p">{loading && "Loading ..."}</Typography>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(withFirebase(Device));
