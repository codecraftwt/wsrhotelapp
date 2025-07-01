// AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProfileScreen from '../screens/setting/ProfileScreen';
import AddEmployeeScreen from '../screens/employee/AddEmployeeScreen';
import AdvanceEntryScreen from '../screens/dashboard/AdvanceEntryScreen';
import MaterialRequestScreen from '../screens/inventory/MaterialRequestScreen';
import ExpenseEntryScreen from '../screens/expense/ExpenseEntryScreen';
import ReportsScreen from '../screens/report/ReportsScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import AddHotel from '../screens/hotel/AddHotel';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#1c2f87',
  accent: '#fe8c06',
  inactive: 'gray',
};

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'apps-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ navigation }) => ({
        headerStyle: { 
          backgroundColor: COLORS.primary,
          height: 130,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontSize: 20,
          fontFamily: 'Poppins-SemiBold',
          textAlign: 'center',
        },
        drawerActiveTintColor: COLORS.accent,
        drawerInactiveTintColor: COLORS.inactive,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        component={BottomTabs}
        options={{ title: 'Dashboard' }}
      />
       <Drawer.Screen
        name="AddHotel"
        component={AddHotel}
        options={{ title: 'Add Hotel' }}
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
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}