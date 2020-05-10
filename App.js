import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import PlayerView from './views/PlayerView';
import BrowseView from './views/BrowseView';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Player' headerMode='none'>
        <Stack.Screen name='Player' component={PlayerView} />
        <Stack.Screen name='Browse' component={BrowseView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
