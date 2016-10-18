import React, { Component } from 'react';
import {
    Text,
    View,
    Picker,
    Dimensions
} from 'react-native';
import styles from './styles';
import colors from './colors';
import {
    MKButton
} from 'react-native-material-kit';
import KeepAwake from 'react-native-keep-awake';

import { beep, bell1, bell3 } from './audio';
const Orientation = require('react-native-orientation');

import { formatSeconds } from './utils';

import settingsWrapper from './settingsStorage';

const INITIAL_COUNTDOWN_COUNT = 3 + 1;
const SECOND = 1000;

const INITIAL_COUNTDOWN_STEP = 'INITIAL_COUNTDOWN_STEP';
const ROUND_COUNTDOWN_STEP = 'ROUND_COUNTDOWN_STEP';
const BREAK_COUNTDOWN_STEP = 'BREAK_COUNTDOWN_STEP';

const Timer = settingsWrapper(class T extends Component {

    _countdown(...args) {
        const [fn, lastFn, timeout, n] = args;
        this.currentCountdownArgs = args;
        this.countdownHandler = setTimeout(() => {
            if (n <= 1) {
                lastFn();
            } else {
                fn(n - 1);
                this._countdown(fn, lastFn, timeout, n - 1);
            }
        }, timeout)   ;
    }

    _clearCountdown() {
        clearTimeout(this.countdownHandler);
    }

    play() {
        this.runInitialCountdown();
    }

    clear() {
        this._clearCountdown();
        this.setState({...this.initialState(this.props)});
    }

   

    initialState = (props) => ({
        round: 1,
        roundTimeLeft: undefined,
        breakTimeLeft: undefined,
        step: INITIAL_COUNTDOWN_STEP
    });

    constructor(props) {
        super();
        this.state = this.initialState(props);
    }

    runInitialCountdown() {
        this.setState({step: INITIAL_COUNTDOWN_STEP});
        this._countdown(() => {
            beep(); // initial tick
        }, () => {
            bell1(); // Initial countdown end
            this.runRoundCountdown();
        }, SECOND, INITIAL_COUNTDOWN_COUNT);
    }

    runRoundCountdown() {
        const { settings } = this;
        this.setState({step: ROUND_COUNTDOWN_STEP});
        this._countdown((n) => {
            this.setState({
                roundTimeLeft: (this.state.roundTimeLeft || settings.roundTime) - 1
            }, () => {
                if (n <= 3) beep();
            });
        }, () => {
            this.setState({
                roundTimeLeft: settings.roundTime
            }, () => {
                if (this.state.round === settings.rounds) {
                    this.clear();
                    this.props.end();
                    bell3();
                } else {
                    bell1();
                    this.runBreakCountdown();
                }
            })
        }, SECOND, settings.roundTime);
    }

    runBreakCountdown() {
        const { settings } = this;
        this.setState({step: BREAK_COUNTDOWN_STEP});
        this._countdown((n) => {
            this.setState({
                breakTimeLeft: (this.state.breakTimeLeft || settings.breakTime) - 1
            }, () => {
                if (n <= 3) beep();
            });
        }, () => {
            this.setState({
                breakTimeLeft: settings.breakTime,
                round: this.state.round + 1
            }, () => {
                bell1(); // break end beep
                this.runRoundCountdown();
            });

        }, SECOND, settings.breakTime);
    }

    togglePause() {
        if (!this.props.paused) {
            this._clearCountdown();
        } else {
            this._countdown(...this.currentCountdownArgs);
        }
    }

    render() {
        const { vw, vh } = this.context;
        const { settings } = this;
        const { rounds, roundTime, breakTime } = settings;
        const { round, roundTimeLeft, breakTimeLeft, step } = this.state;

        const roundTextStyle = [styles.text, styles.timerText, {
            fontSize: 6 * vw
        }];
        const timerTitleTextStyle = [styles.text, styles.timerTitleText, {
            fontSize: 6 * vw
        }];

        const activeStyle = {
            fontSize: 8 * vw
        };

        const roundTimeTextStyle = [
            roundTextStyle,
            step === ROUND_COUNTDOWN_STEP ? activeStyle : false
        ];
        const breakTimeTextStyle = [
            roundTextStyle,
            step === BREAK_COUNTDOWN_STEP ? activeStyle : false
        ];
        return (
            <View>
                <View style={{justifyContent: 'center'}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={[timerTitleTextStyle]}>Round:</Text>
                        </View>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={[roundTextStyle]}>{round}/{rounds}</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={[timerTitleTextStyle]}>Round time{step === ROUND_COUNTDOWN_STEP ? ' left' : ''}:</Text>
                        </View>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={roundTimeTextStyle}>{formatSeconds(roundTimeLeft || roundTime)}</Text>
                        </View>

                    </View>
                    <View style={styles.separator} />
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={[timerTitleTextStyle]}>Break time{step === BREAK_COUNTDOWN_STEP ? ' left' : ''}:</Text>
                        </View>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={breakTimeTextStyle}>{formatSeconds(breakTimeLeft || breakTime)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

});

Timer.contextTypes = {
    vw: React.PropTypes.number,
    vh: React.PropTypes.number,
};

const MainScreen = class MainScreen extends Component {

    constructor() {
        super();
        this.state = {
            started: false,
            paused: false
        }
    }

    toggle() {
        const { started } = this.state;
        if (started) {
            this.clear();
        } else {

            this.refs.timer.play();
            KeepAwake.activate(); // screen always active, including pause mode
        }
        this.setState({
            started: !started
        });
    }

    togglePause() {
        this.setState({
            paused: !this.state.paused
        });
        this.refs.timer.togglePause();
    }

    clear() {
        this.setState({
            started: false,
            paused: false
        });
        this.refs.timer.clear();
        KeepAwake.deactivate();
    }

    onTimerEnd() {
        this.setState({
            started: false
        });
    }
   
    render() {
        const { vw, vh } = this.context;
        const { started, paused } = this.state;
        const buttonTextStyle = [styles.text, styles.timerText, {
            fontSize: 6 * vw
        }];
        return (
            <View style={[styles.container, {flexDirection: 'row'}]}>
                <View style={{flex: 0.2}}/>
                <View style={{flex: 0.8, justifyContent: 'center'}}>
                    <Timer end={this.onTimerEnd.bind(this)} started={started} paused={paused} ref="timer"/>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
                        {started ? <MKButton
                            testID="pause-resume-button"
                            backgroundColor={colors.theme3}
                            shadowRadius={2}
                            shadowOffset={{width:0, height:2}}
                            shadowOpacity={.7}
                            shadowColor="black"
                            onPress={this.togglePause.bind(this)}
                            style={{flex: 1, flexDirection: 'row', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, justifyContent: 'center'}}
                        ><Text style={buttonTextStyle}>{paused ? 'Resume' : 'Pause'}</Text></MKButton> : false}
                        <MKButton
                            testID="start-stop-button"
                            backgroundColor={started ? colors.accent900 : colors.primary500}
                            shadowRadius={2}
                            shadowOffset={{width:0, height:2}}
                            shadowOpacity={.7}
                            shadowColor="black"
                            onPress={this.toggle.bind(this)}
                            style={{flex: 1, flexDirection: 'row', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, justifyContent: 'center'}}
                        >
                            <Text pointerEvents="none"
                                  style={buttonTextStyle}>
                                {started ? 'Stop' : 'Start'}
                            </Text>
                        </MKButton>
                    </View>
                </View>
                <View style={{flex: 0.2}}/>

            </View>
        );
    }
};

MainScreen.contextTypes = {
    vw: React.PropTypes.number,
    vh: React.PropTypes.number,
};

export default MainScreen;