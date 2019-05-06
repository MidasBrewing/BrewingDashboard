import React, { Component } from 'react';
import _ from 'lodash';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import { withFirebase } from '../Firebase';

am4core.useTheme(am4themes_animated);

const styles = {
    card: {
        minWidth: 275,
    },
    title: {
        fontSize: 20,
    },
};

class Fermentation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            lastTimeSpanInSec: 0,
            lastBubbleAt: null
        };

        this.id = _.uniqueId("chart-");

        this.doResetFermentationEntires = this.doResetFermentationEntires.bind(this);
        this.loadFermentations = this.loadFermentations.bind(this);
    }

    loadFermentations() {
        const { batch, firebase } = this.props;

        this.setState({ loading: true });

        firebase.fermentations(batch)
            .orderByKey()
            .limitToLast(20)
            .on('value', snapshot => {
                const data = snapshot.val() || {};
                const fermentations = Object.values(data);
                const lastTimeSpanInSec = this.getLastTimeSpanInSec(fermentations);
                const lastBubbleAt = fermentations.length ? new Date(fermentations[0].at) : null; // fermentations is (already) reversed

                this.setState({
                    lastTimeSpanInSec: lastTimeSpanInSec,
                    loading: false,
                    lastBubbleAt: lastBubbleAt
                });
            });
    }

    componentDidMount() {
        this.loadFermentations();
        
        let chart = am4core.create('' + this.id, am4charts.GaugeChart);
        chart.innerRadius = am4core.percent(82);

        const minValue = 0;
        const maxValue = 60 * 10; // 20 min
        
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
        axis.renderer.labels.template.adapter.add("text", function(text) {
            if (!text) {
                return text;
            }
            const val = text.replace(',', '');
            if (val < 60) {
                return val + 's';
            }
            const mins = Math.floor(val / 60);
            const secs = val - (mins * 60); 
            if (secs === 0) {
                return mins + 'm';
            }
            return mins + ":" + secs + "m";
        });

        /**
         * Axis for ranges
         */

        var colorSet = new am4core.ColorSet();

        var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
        axis2.min = minValue;
        axis2.max = maxValue;
        axis2.renderer.minGridDistance = 60;
        axis2.renderer.innerRadius = 10
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
            range0.endValue = ev.target.value;
            range1.value = ev.target.value;
            axis2.invalidate();
        });

        const { lastTimeSpanInSec } = this.state;
        label.text = lastTimeSpanInSec + 's';
        hand.value = lastTimeSpanInSec;

        this.hand = hand;
        this.label = label;
        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    componentDidUpdate(oldProps) {
        const { lastTimeSpanInSec } = this.state;

        this.label.text = lastTimeSpanInSec + 's';
        var animation = new am4core.Animation(this.hand, {
            property: "value",
            to: lastTimeSpanInSec
        }, 1000, am4core.ease.cubicOut).start();
    }

    getLastTimeSpanInSec(fermentations) {
        if (!fermentations) {
            return 0;
        }
        const reversed = fermentations.reverse(); 
        const minSpanInSec = 5; // avoid multiple bubbles for "one" bubble
        let latestAt;
        for (let [index, val] of reversed.entries()) {
            if (latestAt) {
                const previousAt = new Date(val.at);
                const diffInSec = (latestAt - previousAt) / 1000;
                if (diffInSec > minSpanInSec) {
                    return Math.round(diffInSec);
                }
            } else {
                latestAt = new Date(val.at);
            }
        }
        return 0;
    }

    render() {
        const { classes, batch } = this.props;
        const { lastBubbleAt, loading } = this.state;

        return (
            <Card className={classes.card}>
                <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Time between bubbles in batch {batch}
                    </Typography>
                    <div id={this.id} style={{  height: "200px" }}></div>
                    <Typography component="p">
                        {loading && 'Loading ...'}
                        Last bubble at: { lastBubbleAt ? lastBubbleAt.toLocaleDateString() + ' ' + lastBubbleAt.toLocaleTimeString() : '-' }
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={ this.doResetFermentationEntires }>Reset</Button>
                </CardActions>
            </Card>
        );
    }

    doResetFermentationEntires() {
        const { batch, firebase } = this.props;
        
        firebase.fermentations(batch).set({}); 
        
        this.setState({
            lastTimeSpanInSec: 0,
        });
    }
}

export default withStyles(styles)(withFirebase(Fermentation));