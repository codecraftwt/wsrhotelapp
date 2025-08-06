import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n/i18n';
import { StatusBar, View, Text, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Loading component for PersistGate
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    {/* <Text style={styles.loadingText}>Loading...</Text> */}
  </View>
);

// Custom Success Toast Component
const CustomSuccessToast = ({ text1, text2 }) => (
  <View style={styles.successToastContainer}>
    <View style={styles.toastIconContainer}>
      <Ionicons name="checkmark-circle" size={24} color="#fff" />
    </View>
    <View style={styles.toastContent}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  </View>
);

// Custom Error Toast Component
const CustomErrorToast = ({ text1, text2 }) => (
  <View style={styles.errorToastContainer}>
    <View style={styles.toastIconContainer}>
      <Ionicons name="close-circle" size={24} color="#fff" />
    </View>
    <View style={styles.toastContent}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  </View>
);

// Custom Info Toast Component
const CustomInfoToast = ({ text1, text2 }) => (
  <View style={styles.infoToastContainer}>
    <View style={styles.toastIconContainer}>
      <Ionicons name="information-circle" size={24} color="#fff" />
    </View>
    <View style={styles.toastContent}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  </View>
);

// Custom Warning Toast Component
const CustomWarningToast = ({ text1, text2 }) => (
  <View style={styles.warningToastContainer}>
    <View style={styles.toastIconContainer}>
      <Ionicons name="warning" size={24} color="#fff" />
    </View>
    <View style={styles.toastContent}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  </View>
);

const toastConfig = {
  success: (props) => <CustomSuccessToast {...props} />,
  error: (props) => <CustomErrorToast {...props} />,
  info: (props) => <CustomInfoToast {...props} />,
  warning: (props) => <CustomWarningToast {...props} />,
};

// ✅ SafeArea-aware Toast Wrapper
const ToastWrapper = () => {
  const insets = useSafeAreaInsets();

  return (
    <Toast
      config={toastConfig}
      position="bottom"
      visibilityTime={4000}
      autoHide={true}
      bottomOffset={insets.bottom + 16} // Safe padding from bottom
    />
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar backgroundColor="#1c2f87" barStyle="light-content" />
          <NavigationContainer>
            <AppNavigator />
            <ToastWrapper />
          </NavigationContainer>
        </SafeAreaProvider>
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
  successToastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 8,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorToastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoToastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  warningToastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  toastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
