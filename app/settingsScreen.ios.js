import React, { Component } from 'react';
import { formatSeconds } from './utils';
const R = require('ramda');
import styles from './styles';
import { observer } from 'mobx-react/native';
import settingsWrapper from './settingsStorage';
import {
    StyleSheet,
    Text,
    View,
    Picker
} from 'react-native';

const Item = Picker.Item;

import { MIN_ROUNDS, MAX_ROUNDS, MIN_TIME, MAX_TIME, TIME_STEP } from './constants';

const SettingsScreen = settingsWrapper(class SettingsScreen extends Component {
    _valueChange = (key) => (value) => {
        this.settings[key] = value;
    };
    render() {
        const { settings } = this;
        return (
            <View style={[styles.container, {flexDirection: 'row'}]}>
                <View style={styles.labeledPicker}>
                    <Text style={styles.text}>Rounds</Text>
                    <Picker
                        style={styles.picker}
                        itemStyle={styles.text}
                        selectedValue={settings.rounds}
                        onValueChange={this._valueChange('rounds')}>
                        {R.range(MIN_ROUNDS, MAX_ROUNDS).map(r =>
                            <Item label={'' + r} value={r} key={r} />
                        )}
                    </Picker>
                </View>
                <View style={styles.labeledPicker}>
                    <Text style={styles.text}>Training Time</Text>
                    <Picker
                        style={styles.picker}
                        itemStyle={styles.text}
                        selectedValue={settings.roundTime}
                        onValueChange={this._valueChange('roundTime')}>
                        {R.range(MIN_TIME, MAX_TIME).filter(n => n % TIME_STEP === 0).map(t =>
                            <Item label={formatSeconds(t)} value={t} key={t} />
                        )}
                    </Picker>
                </View>
                <View style={styles.labeledPicker}>
                    <Text style={styles.text}>Break Time</Text>
                    <Picker
                        style={styles.picker}
                        itemStyle={styles.text}
                        selectedValue={settings.breakTime}
                        onValueChange={this._valueChange('breakTime')}>
                        {R.range(MIN_TIME, MAX_TIME).filter(n => n % TIME_STEP === 0).map(t =>
                            <Item label={formatSeconds(t)} value={t} key={t} />
                        )}
                    </Picker>
                </View>
            </View>
        );
    }
});


export default SettingsScreen;