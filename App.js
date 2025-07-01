import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n/i18n';
import { StatusBar } from 'react-native';

// Redux
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <>
          <StatusBar backgroundColor="#1c2f87" barStyle="light-content" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </>
      </PersistGate>
    </Provider>
  );
}
