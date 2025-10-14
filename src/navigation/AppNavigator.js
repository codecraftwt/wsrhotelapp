import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import api from '../api/axiosInstance';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProfileScreen from '../screens/setting/ProfileScreen';
import HelpSupportScreen from '../screens/setting/HelpSupportScreen';
import AboutScreen from '../screens/setting/AboutScreen';
import PrivacySecurityScreen from '../screens/setting/PrivacySecurityScreen';
import SettingsScreen from '../screens/setting/SettingsScreen';
import AddEmployeeScreen from '../screens/employee/AddEmployeeScreen';
import AdvanceEntryScreen from '../screens/dashboard/AdvanceEntryScreen';
import MaterialRequestScreen from '../screens/inventory/MaterialRequestScreen';
import ExpenseEntryScreen from '../screens/expense/ExpenseEntryScreen';
import ReportsScreen from '../screens/report/ReportsScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import AddHotel from '../screens/hotel/AddHotel';
import Splash from '../screens/auth/Splash';
import MaterialsScreen from '../screens/master/MaterialsScreen';
import PaymentModesScreen from '../screens/master/PaymentModesScreen';
import PaymentLedgerScreen from '../screens/payment/PaymentLedgerScreen';
import MaterialReportScreen from '../screens/report/MaterialReportScreen';
import AdvanceReportScreen from '../screens/report/AdvanceReportScreen';
import PaymentReportScreen from '../screens/report/PaymentReportScreen';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchMenuAccess } from '../redux/slices/menuAccessSlice';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#1c2f87',
  accent: '#fe8c06',
  background: '#f8f9fa',
  inactive: '#6c757d',
  text: '#212529',
  drawerHeader: '#1c2f87',
  drawerItemActive: '#f0f4ff',
};

const drawerScreens = [
  {
    name: 'AddHotel',
    component: AddHotel,
    title: 'All Hotels',
    icon: ({ focused, color }) => (
      <Ionicons
        name={focused ? 'business' : 'business-outline'}
        size={24}
        color={color}
      />
    ),
  },
  {
    name: 'AddEmployee',
    component: AddEmployeeScreen,
    title: 'All Employee',
    icon: ({ focused, color }) => (
      <MaterialIcons
        name={focused ? 'person-add' : 'person-add-alt'}
        size={24}
        color={color}
      />
    ),
  },
  {
    name: 'AdvanceEntry',
    component: AdvanceEntryScreen,
    title: 'Advance Ledger',
    icon: ({ focused, color }) => (
      <MaterialIcons
        name={focused ? 'payments' : 'payment'}
        size={24}
        color={color}
      />
    ),
  },
  {
    name: 'MaterialRequest',
    component: MaterialRequestScreen,
    title: 'Material Requests',
    icon: ({ focused, color }) => (
      <Ionicons
        name={focused ? 'list' : 'list-outline'}
        size={24}
        color={color}
      />
    ),
  },
  {
    name: 'ExpenseEntry',
    component: ExpenseEntryScreen,
    title: 'Expense Entry',
    icon: ({ focused, color }) => (
      <MaterialIcons
        name={focused ? 'receipt' : 'receipt-long'}
        size={24}
        color={color}
      />
    ),
  },
  {
    name: 'PaymentLedger',
    component: PaymentLedgerScreen,
    title: 'Payment Ledger',
    icon: ({ focused, color }) => (
      <MaterialIcons name="account-balance" size={24} color={color} />
    ),
  },
];

function CustomDrawerContent(props) {
  const dispatch = useDispatch();
  
  const [showMaster, setShowMaster] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const { menus, loading: menuLoading } = useSelector(state => state.menuAccess);
  const { user } = useSelector(state => state.auth);

  // Refetch menus on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('Fetching menu access for user:', user.id);
      dispatch(fetchMenuAccess(user.id));
    }
  }, [user?.id, dispatch]);

  // Add a function to refresh menu access
  const refreshMenuAccess = () => {
    if (user?.id) {
      console.log('Refreshing menu access for user:', user.id);
      dispatch(fetchMenuAccess(user.id));
    }
  };

  // Create a more robust menu access check
  const allowedMenuNames = new Set((menus || []).map(m => m.name));
  console.log('Available menus:', menus);
  console.log('Allowed menu names:', Array.from(allowedMenuNames));

  const hasAccess = (name) => {
    const hasAccessResult = allowedMenuNames.has(name);
    console.log(`Checking access for "${name}":`, hasAccessResult);
    return hasAccessResult;
  };
  const menuMap = {
  'Dashboard': {
    screen: 'Dashboard',
    icon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
  },
  'Payment Nodes': {
    screen: 'Payment Modes',
    icon: ({ color }) => <Ionicons name="card" size={24} color={color} />,
  },
  'Material': {
    screen: 'Materials',
    icon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
  },
  'Employees': {
    screen: 'AddEmployee',
    icon: ({ color }) => <MaterialIcons name="person-add-alt" size={24} color={color} />,
  },
  'Advance Ledger': {
    screen: 'AdvanceEntry',
    icon: ({ color }) => <MaterialIcons name="payment" size={24} color={color} />,
  },
  'Material Request': {
    screen: 'MaterialRequest',
    icon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} />,
  },
  'Expenses': {
    screen: 'ExpenseEntry',
    icon: ({ color }) => <MaterialIcons name="receipt-long" size={24} color={color} />,
  },
  'Payment Ledger': {
    screen: 'PaymentLedger',
    icon: ({ color }) => <MaterialIcons name="account-balance" size={24} color={color} />,
  },
  'Settings': {
    screen: 'Profile', // or 'SettingsScreen' if different
    icon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
  },
};


  const handleLogout = () => {
    delete api.defaults.headers.common['Authorization'];
    dispatch(logout());
    props.navigation.replace('Login');
  };

  const currentRoute = props.state.routes[props.state.index].name;

  // Filter out Dashboard and Master screens from automatic rendering
  const filteredItems = Object.keys(props.descriptors)
    .filter(
      key =>
        props.descriptors[key].route.name !== 'Dashboard' &&
        props.descriptors[key].route.name !== 'Payment Modes' &&
        props.descriptors[key].route.name !== 'Materials' &&
        props.descriptors[key].route.name !== 'MaterialReport' &&
        props.descriptors[key].route.name !== 'AdvanceReport' &&
        props.descriptors[key].route.name !== 'PaymentReport' &&
        props.descriptors[key].route.name !== 'Settings',
    )
    .map(key => ({
      ...props.descriptors[key].route,
      key: props.descriptors[key].route.key,
      descriptor: props.descriptors[key],
    }))
    // Apply access control mapping route names to menu names from API
    .filter(route => {
      const routeNameToMenuName = {
        AddHotel: 'All Hotel',
        AddEmployee: 'Employees',
        AdvanceEntry: 'Advance Ledger',
        MaterialRequest: 'Material Request',
        ExpenseEntry: 'Expenses',
        PaymentLedger: 'Payment Ledger',
      };
      const required = routeNameToMenuName[route.name];
      if (!required) {
        console.log(`Route "${route.name}" not mapped, allowing access`);
        return true; // if not mapped, keep as is
      }
      const hasAccessResult = hasAccess(required);
      console.log(`Route "${route.name}" requires "${required}" access:`, hasAccessResult);
      return hasAccessResult;
    });

  console.log('Filtered items count:', filteredItems.length);
  console.log('Menu loading state:', menuLoading);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
    <View style={styles.drawerHeader}>
        <Image
          source={require('../assets/walstar-logo.png')}
          style={styles.drawerLogo}
          resizeMode="contain"
        />
        <Text style={styles.drawerTitle}>Hotel Management</Text>
        <Text style={styles.drawerSubtitle}>Admin Dashboard</Text>
      </View>

      <ScrollView style={styles.drawerItems} showsVerticalScrollIndicator={false}>
        {/* Manually render Dashboard first (always show Dashboard) */}
        <DrawerItem
          label="Dashboard"
          icon={({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          )}
          onPress={() => props.navigation.navigate('Dashboard')}
          focused={props.state.index === 0}
          labelStyle={styles.drawerLabelStyle}
          style={props.state.index === 0 ? styles.activeItem : null}
        />

        {/* Master section - show if loading or if user has access to any master items */}
        {(menuLoading || menus.length === 0 || hasAccess('Payment Nodes') || hasAccess('Material')) && (
          <View style={styles.masterContainer}>
            <DrawerItem
              label="Master"
              icon={({ color }) => (
                <Ionicons name="briefcase" size={24} color={color} />
              )}
              onPress={() => setShowMaster(!showMaster)}
              labelStyle={styles.masterLabelStyle}
            />
            <View style={styles.chevronContainer}>
              <Ionicons
                name={showMaster ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={COLORS.text}
                onPress={() => setShowMaster(!showMaster)}
              />
            </View>
          </View>
        )}

        {showMaster && (
          <>
            {(menuLoading || menus.length === 0 || hasAccess('Payment Nodes')) && (
              <DrawerItem
                label="Payment Modes"
                icon={({ color }) => (
                  <Ionicons
                    name="card"
                    size={24}
                    color={color}
                    style={{ marginLeft: 25 }}
                  />
                )}
                onPress={() => props.navigation.navigate('Payment Modes')}
                focused={currentRoute === 'Payment Modes'}
                labelStyle={styles.subItemLabelStyle}
                style={
                  currentRoute === 'Payment Modes' ? styles.activeItem : null
                }
              />
            )}
            {(menuLoading || menus.length === 0 || hasAccess('Material')) && (
              <DrawerItem
                label="Materials"
                icon={({ color }) => (
                  <Ionicons
                    name="cube"
                    size={24}
                    color={color}
                    style={{ marginLeft: 25 }}
                  />
                )}
                onPress={() => props.navigation.navigate('Materials')}
                focused={currentRoute === 'Materials'}
                labelStyle={styles.subItemLabelStyle}
                style={currentRoute === 'Materials' ? styles.activeItem : null}
              />
            )}
          </>
        )}

     
        {/* Render other drawer items */}
        {filteredItems.length > 0 ? (
          filteredItems.map((route, i) => {
            const { options } = route.descriptor;
            const label =
              options.drawerLabel !== undefined
                ? options.drawerLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            return (
              <DrawerItem
                key={route.key}
                label={label}
                icon={options.drawerIcon}
                onPress={() => props.navigation.navigate(route.name)}
                focused={currentRoute === route.name}
                labelStyle={styles.drawerLabelStyle}
                style={currentRoute === route.name ? styles.activeItem : null}
              />
            );
          })
        ) : (
          // Show a message when no items are available (for debugging)
          menuLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>Loading menu items...</Text>
            </View>
          ) : menus.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>No menu access configured</Text>
            </View>
          ) : null
        )}
        {/* Reports section - show if loading or if user has access to any report items */}
        {(menuLoading || menus.length === 0 || hasAccess('Material Report') || hasAccess('Advance Report') || hasAccess('Payment Report')) && (
          <View style={styles.masterContainer}>
            <DrawerItem
              label="Reports"
              icon={({ color }) => (
                <Ionicons name="document-text" size={24} color={color} />
              )}
              onPress={() => setShowReports(!showReports)}
              labelStyle={styles.masterLabelStyle}
            />
            <View style={styles.chevronContainer}>
              <Ionicons
                name={showReports ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={COLORS.text}
                onPress={() => setShowReports(!showReports)}
              />
            </View>
          </View>
        )}

        {showReports && (
          <>
            {(menuLoading || menus.length === 0 || hasAccess('Material Report')) && (
              <DrawerItem
                label="Material Report"
                icon={({ color }) => (
                  <Ionicons
                    name="cube"
                    size={24}
                    color={color}
                    style={{ marginLeft: 25 }}
                  />
                )}
                onPress={() => props.navigation.navigate('MaterialReport')}
                focused={currentRoute === 'MaterialReport'}
                labelStyle={styles.subItemLabelStyle}
                style={
                  currentRoute === 'MaterialReport' ? styles.activeItem : null
                }
              />
            )}
            {(menuLoading || menus.length === 0 || hasAccess('Advance Report')) && (
              <DrawerItem
                label="Advance Report"
                icon={({ color }) => (
                  <Ionicons
                    name="cash"
                    size={24}
                    color={color}
                    style={{ marginLeft: 25 }}
                  />
                )}
                onPress={() => props.navigation.navigate('AdvanceReport')}
                focused={currentRoute === 'AdvanceReport'}
                labelStyle={styles.subItemLabelStyle}
                style={
                  currentRoute === 'AdvanceReport' ? styles.activeItem : null
                }
              />
            )}
            {(menuLoading || menus.length === 0 || hasAccess('Payment Report')) && (
              <DrawerItem
                label="Payment Report"
                icon={({ color }) => (
                  <Ionicons
                    name="wallet"
                    size={24}
                    color={color}
                    style={{ marginLeft: 25 }}
                  />
                )}
                onPress={() => props.navigation.navigate('PaymentReport')}
                focused={currentRoute === 'PaymentReport'}
                labelStyle={styles.subItemLabelStyle}
                style={
                  currentRoute === 'PaymentReport' ? styles.activeItem : null
                }
              />
            )}
          </>
        )}

        {/* Settings (always show Settings) */}
        <DrawerItem
          label="Settings"
          icon={({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          )}
          onPress={() => props.navigation.navigate('Settings')}
          focused={currentRoute === 'Settings'}
          labelStyle={styles.drawerLabelStyle}
          style={currentRoute === 'Settings' ? styles.activeItem : null}
        />

      </ScrollView>

      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#fff',
          position: 'absolute',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'Poppins-Medium',
        },
        tabBarIcon: ({ focused, color }) => {
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
          return <Ionicons name={iconName} size={24} color={color} />;
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
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: 23,
          borderBottomRightRadius: 23,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          // height: Platform.OS === 'ios' ? 120 : 120,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontSize: 20,
          fontFamily: 'Poppins-SemiBold',
        },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
        drawerActiveBackgroundColor: COLORS.drawerItemActive,
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.text,
        drawerLabelStyle: {
          fontSize: 18,
          fontFamily: 'Rubik-Regular',
          marginLeft: 16,
        },
       drawerStyle: {
          width: 300,
          position: Platform.OS === 'ios' ? 'absolute' : 'absolute',
        },
        drawerType: Platform.OS === 'ios' ? 'front' : 'front', 
        overlayColor: 'rgba(0,0,0,0.5)',
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
          drawerItemStyle: { height: 0 }, // Hide from automatic rendering
        }}
      >
        {() => <BottomTabs />}
      </Drawer.Screen>

      {drawerScreens.map(screen => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            title: screen.title,
            drawerIcon: screen.icon,
          }}
        />
      ))}

      {/* Hidden screens for Master section */}
      <Drawer.Screen
        name="Payment Modes"
        component={PaymentModesScreen}
        options={{
          title: 'Payment Modes',
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="Materials"
        component={MaterialsScreen}
        options={{
          title: 'Materials',
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="MaterialReport"
        component={MaterialReportScreen}
        options={{
          title: 'Material Report',
          drawerItemStyle: { height: 0 }, // Hide from automatic rendering
        }}
      />
      <Drawer.Screen
        name="AdvanceReport"
        component={AdvanceReportScreen}
        options={{
          title: 'Advance Report',
          drawerItemStyle: { height: 0 }, // Hide from automatic rendering
        }}
      />
      <Drawer.Screen
        name="PaymentReport"
        component={PaymentReportScreen}
        options={{
          title: 'Payment Report',
          drawerItemStyle: { height: 0 }, // Hide from automatic rendering
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerItemStyle: { height: 0 },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  drawerHeader: {
    backgroundColor: COLORS.drawerHeader,
    marginLeft: -15,
    marginRight: -15,
    padding: 20,
    paddingTop: Platform.select({
      ios: 60,
      android: StatusBar.currentHeight + 10 || 20,
    }),
    paddingBottom: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  drawerLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    alignSelf: 'center',
  },
  drawerTitle: {
    fontSize: 22,
    fontFamily: 'Rubik-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  drawerItems: {
    flex: 1,
    paddingHorizontal: 10,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  drawerLabelStyle: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    marginLeft: 16,
  },
  activeItem: {
    backgroundColor: COLORS.drawerItemActive,
    borderRadius: 25,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    backgroundColor: '#FE8C06',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: '#fe8c06',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: '#ffffff',
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  masterContainer: {
    position: 'relative',
  },
  masterLabelStyle: {
    fontSize: 18,
    fontFamily: 'Rubik-Regular',
    marginLeft: 16,
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: 12,
    zIndex: 1,
  },
  subItemLabelStyle: {
    fontSize: 17,
    fontFamily: 'Rubik-Regular',
    marginLeft: 16,
  },
});
