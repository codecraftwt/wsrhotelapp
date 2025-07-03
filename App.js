import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n/i18n';
import { StatusBar, View, Text, StyleSheet } from 'react-native';

// Redux
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';

// Loading component for PersistGate
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    {/* <Text style={styles.loadingText}>Loading...</Text> */}
  </View>
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c2f87',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
  },
});
