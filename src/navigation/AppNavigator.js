import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import AdvanceEntryScreen from '../screens/AdvanceEntryScreen';
import MaterialRequestScreen from '../screens/MaterialRequestScreen';
import ExpenseEntryScreen from '../screens/ExpenseEntryScreen';
import ReportsScreen from '../screens/ReportsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{ title: 'Home' }}
      />
      <Drawer.Screen
        name="AddEmployee"
        component={AddEmployeeScreen}
        options={{ title: 'Add Employee' }}
      />
      <Drawer.Screen
        name="AdvanceEntry"
        component={AdvanceEntryScreen}
        options={{ title: 'Advance Entry' }}
      />
      <Drawer.Screen
        name="MaterialRequest"
        component={MaterialRequestScreen}
        options={{ title: 'Material Request' }}
      />
      <Drawer.Screen
        name="ExpenseEntry"
        component={ExpenseEntryScreen}
        options={{ title: 'Expense Entry' }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Drawer.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainDrawer} />
    </Stack.Navigator>
  );
}
