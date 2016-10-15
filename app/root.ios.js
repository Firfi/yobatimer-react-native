import MainScreen from './mainScreen';
import SettingsScreen from './settingsScreen';

import React, { Component, PropTypes } from 'react';
import { NavigatorIOS, Text, AppRegistry, TabBarIOS, StatusBar, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DEFAULT_ROUNDS, DEFAULT_ROUND_TIME, DEFAULT_BREAK_TIME } from './constants';
import colors from './colors';

export default class YobaTimer extends Component {
    constructor(props) {
        super();
        this.state = {
            selectedTab: 'home'
        };
    }
    render() {
        return (
            <View style={{flex: 1}}>
                <StatusBar
                    backgroundColor={colors.theme}
                    barStyle="light-content"
                    networkActivityIndicatorVisible={false}
                />
                <TabBarIOS style={{flex: 1}} barTintColor={colors.theme1} tintColor={colors.primary500} unselectedTintColor={colors.primary100}>
                    <Icon.TabBarItemIOS
                        style={{flex: 1}}
                        title="Home"
                        iconName="ios-home"
                        selectedIconName="ios-home"
                        selected={this.state.selectedTab === 'home'}
                        renderAsOriginal={true}
                        iconColor={colors.primary100}
                        selectedIconColor={colors.primary500}
                        onPress={() => {
                            this.setState({
                              selectedTab: 'home'
                            });
                          }}
                    >
                        <MainScreen
                            ref="mainScreen"
                        />
                    </Icon.TabBarItemIOS>

                    <Icon.TabBarItemIOS
                        title="Settings"
                        iconName="ios-settings"
                        selectedIconName="ios-settings"
                        selected={this.state.selectedTab === 'settings'}
                        renderAsOriginal={true}
                        iconColor={colors.primary100}
                        selectedIconColor={colors.primary500}
                        onPress={() => {
                            this.setState({
                              selectedTab: 'settings'
                            });
                            this.refs.mainScreen.clear();
                          }}
                    >
                        <SettingsScreen/>
                    </Icon.TabBarItemIOS>

            </TabBarIOS></View>

        );
    }
}

AppRegistry.registerComponent('YobaTimer', () => YobaTimer);
