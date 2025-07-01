import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import AdvanceEntryScreen from '../screens/AdvanceEntryScreen';
import MaterialRequestScreen from '../screens/MaterialRequestScreen';
import ExpenseEntryScreen from '../screens/ExpenseEntryScreen';
import ReportsScreen from '../screens/ReportsScreen';
import InventoryScreen from '../screens/InventoryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Stack.Screen name="AdvanceEntry" component={AdvanceEntryScreen} />
      <Stack.Screen name="MaterialRequest" component={MaterialRequestScreen} />
      <Stack.Screen name="ExpenseEntry" component={ExpenseEntryScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
    </Stack.Navigator>
  );
}
