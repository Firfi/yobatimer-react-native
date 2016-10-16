import {
    AsyncStorage,
    ActivityIndicator
} from 'react-native';

import mobx, { observable } from 'mobx';
import { observer } from 'mobx-react/native';

const ROUNDS_KEY = '@YobaTimer:rounds';
const ROUND_TIME_KEY = '@YobaTimer:roundtime';
const ROUND_BREAK_KEY = '@YobaTimer:breaktime';

const DEFAULT_ROUNDS = 10;
const DEFAULT_ROUND_TIME = 180;
const DEFAULT_BREAK_TIME = 60;

import React, { Component, PropTypes } from 'react';

const settingsPromise = Promise.all([
    AsyncStorage.getItem(ROUNDS_KEY),
    AsyncStorage.getItem(ROUND_TIME_KEY),
    AsyncStorage.getItem(ROUND_BREAK_KEY)
]).then(vals => vals.map(v => typeof v === 'undefined' ? v : Number(v))).then(([rounds, roundTime, breakTime=DEFAULT_BREAK_TIME]) => {
    rounds = rounds || DEFAULT_ROUNDS; roundTime = roundTime || DEFAULT_ROUND_TIME; breakTime = breakTime || DEFAULT_BREAK_TIME;
    return observable({rounds, roundTime, breakTime});
});

settingsPromise.then(settings => {
    mobx.autorun(() => {
        AsyncStorage.setItem(ROUNDS_KEY, settings.rounds.toString());
        AsyncStorage.setItem(ROUND_TIME_KEY, settings.roundTime.toString());
        AsyncStorage.setItem(ROUND_BREAK_KEY, settings.breakTime.toString());
    });
});

export default (C) => {
    return observer(class SettingsWrapper extends C {
        constructor() {
            super();
            this.state = {...this.state, settingsLoading: true}; // TODO sounds wrong but it is the way to make ref.settings.method() work
        }
        componentWillMount() {
            settingsPromise.then(settings => {
                this.settings = settings;
                this.setState({
                    settingsLoading: false
                });
            });
        }
        render() {
            return this.state.settingsLoading ?
                <ActivityIndicator animating={true} /> :
                super.render();
        }
    })
}
