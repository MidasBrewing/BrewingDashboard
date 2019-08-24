import React, { Component } from "react";
import _ from "lodash";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import WarningIcon from "@material-ui/icons/Warning";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import { withFirebase } from "../Firebase";

am4core.useTheme(am4themes_animated);

const styles = theme => ({
  card: {
    minWidth: 275
  },
  title: {
    fontSize: 20
  },
  icon: {
    marginLeft: theme.spacing.unit * 2,
    verticalAlign: "bottom"
  }
});

class Fermentation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      lastTimeSpanInSec: 0,
      lastBubbleAt: null
    };

    this.id = _.uniqueId("chart-");

    this.doResetBubbleEntires = this.doResetBubbleEntires.bind(this);
    this.loadBubbles = this.loadBubbles.bind(this);
  }

  loadBubbles() {
    const { batch, firebase } = this.props;

    this.setState({ loading: true });

    firebase
      .bubbles(batch)
      .orderByKey()
      //.limitToLast(20)
      .on("value", snapshot => {
        const data = snapshot.val() || {};
        const bubbles = Object.values(data);
        const lastTimeSpanInSec = this.getLastTimeSpanInSec(bubbles);
        const lastBubbleAt = bubbles.length ? new Date(bubbles[0].at) : null; // bubbles is (already) reversed

        this.setState({
          lastTimeSpanInSec: lastTimeSpanInSec,
          loading: false,
          lastBubbleAt: lastBubbleAt
        });
      });
  }

  getTimeSpanText(timeInSec) {
    if (timeInSec < 60) {
      return timeInSec + "s";
    }
    const hours = Math.floor(timeInSec / 3600);
    const mins = Math.floor(timeInSec / 60);
    const secs = timeInSec - (hours * 3600 + mins * 60);
    if (hours === 0) {
      if (secs === 0) {
        return mins + "m";
      }
      return mins + ":" + secs + "m";
    }
    var date = new Date(null);
    date.setSeconds(timeInSec);
    return date.toLocaleTimeString();
  }

  componentDidMount() {
    this.loadBubbles();

    let chart = am4core.create("" + this.id, am4charts.GaugeChart);
    chart.innerRadius = am4core.percent(82);

    const minValue = 0;
    const maxValue = 60 * 10;

    /**
     * Normal axis
     */

    var axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = minValue;
    axis.max = maxValue;
    axis.renderer.minGridDistance = 60;
    axis.renderer.radius = am4core.percent(80);
    axis.renderer.inside = true;
    axis.renderer.line.strokeOpacity = 1;
    axis.renderer.ticks.template.strokeOpacity = 1;
    axis.renderer.ticks.template.length = 10;
    axis.renderer.grid.template.disabled = true;
    axis.renderer.labels.template.radius = 40;
    axis.renderer.inversed = true;

    const getTimeSpanText = this.getTimeSpanText;

    axis.renderer.labels.template.adapter.add("text", function(text) {
      if (!text) {
        return text;
      }
      const val = text.replace(",", "");
      return getTimeSpanText(val);
    });

    /**
     * Axis for ranges
     */

    var colorSet = new am4core.ColorSet();

    var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
    axis2.min = minValue;
    axis2.max = maxValue;
    axis2.renderer.minGridDistance = 60;
    axis2.renderer.innerRadius = 10;
    axis2.strictMinMax = true;
    axis2.renderer.labels.template.disabled = true;
    axis2.renderer.ticks.template.disabled = true;
    axis2.renderer.grid.template.disabled = true;
    axis2.renderer.inversed = true;

    var range0 = axis2.axisRanges.create();
    range0.value = minValue;
    range0.endValue = maxValue / 2;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = colorSet.getIndex(0);

    var range1 = axis2.axisRanges.create();
    range1.value = maxValue / 2;
    range1.endValue = maxValue;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = colorSet.getIndex(2);

    /**
     * Label
     */

    var label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = 20;
    label.x = am4core.percent(50);
    label.y = am4core.percent(100);
    label.horizontalCenter = "middle";
    label.verticalCenter = "bottom";

    /**
     * Hand
     */

    var hand = chart.hands.push(new am4charts.ClockHand());
    hand.axis = axis2;
    hand.innerRadius = am4core.percent(20);
    hand.startWidth = 10;
    hand.pin.disabled = true;

    hand.events.on("propertychanged", function(ev) {
      const value = ev.target.value;
      range0.endValue = value;
      range1.value = value;
      axis2.invalidate();
    });

    const { lastTimeSpanInSec } = this.state;
    label.text = this.getTimeSpanText(lastTimeSpanInSec);
    hand.value = Math.min(lastTimeSpanInSec, maxValue);
    if (lastTimeSpanInSec > 60 * 60) {
      range0.axisFill.fill = am4core.color("red");
    }

    this.hand = hand;
    this.label = label;
    this.chart = chart;
    this.range0 = range0;
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  componentDidUpdate(oldProps) {
    const { lastTimeSpanInSec } = this.state;

    this.label.text = this.getTimeSpanText(lastTimeSpanInSec);

    if (lastTimeSpanInSec > 60 * 60) {
      this.range0.axisFill.fill = am4core.color("red");
    }

    var animation = new am4core.Animation(
      this.hand,
      {
        property: "value",
        to: Math.min(lastTimeSpanInSec, 10 * 60)
      },
      1000,
      am4core.ease.cubicOut
    ).start();
  }

  getLastTimeSpanInSec(bubbles) {
    if (!bubbles || bubbles.length === 1) {
      return 0;
    }
    const reversed = bubbles.reverse();
    const lastBubbleEntry = reversed[0];
    const lastBubbleAt = new Date(lastBubbleEntry.at);
    const secondLastBubbleEntry = reversed[1];
    const secondLastBubbleAt = new Date(secondLastBubbleEntry.at);
    const timeSpanInSec = (lastBubbleAt - secondLastBubbleAt) / 1000;
    const bubbleCount = lastBubbleEntry.count;
    return Math.round(timeSpanInSec / bubbleCount); // will be the average for the time span
  }

  render() {
    const { classes, batch } = this.props;
    const { lastBubbleAt, loading } = this.state;
    const now = new Date();
    const lastBubbleIntervalInMs = lastBubbleAt ? now - lastBubbleAt : 0;
    const longTimeAgo = lastBubbleIntervalInMs > 60 * 60 * 1000;

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            Time between bubbles in batch {batch}
          </Typography>
          <div id={this.id} style={{ height: "200px" }} />
          <Typography component="p">
            {loading && "Loading ..."}
            Last bubble at:{" "}
            {lastBubbleAt
              ? lastBubbleAt.toLocaleDateString() +
                " " +
                lastBubbleAt.toLocaleTimeString()
              : "-"}
            {longTimeAgo && (
              <WarningIcon className={classes.icon} color="error" />
            )}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={this.doResetBubbleEntires}>
            Reset
          </Button>
        </CardActions>
      </Card>
    );
  }

  doResetBubbleEntires() {
    const { batch, firebase } = this.props;

    firebase.bubbles(batch).set({});

    this.setState({
      lastTimeSpanInSec: 0
    });
  }
}

export default withStyles(styles)(withFirebase(Fermentation));
