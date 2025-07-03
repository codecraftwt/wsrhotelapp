import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  SafeAreaView,
  Switch,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../../redux/slices/authSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  ];

  // Handle language change
  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setShowLanguageModal(false);
  };

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    try {
      const result = await launchCamera(options);
      if (result.assets && result.assets[0]) {
        setProfileImage(result.assets[0]);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  // Handle gallery selection
  const handleGallerySelect = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets && result.assets[0]) {
        setProfileImage(result.assets[0]);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.log('Gallery error:', error);
    }
  };

  // Handle profile image selection
  const handleImageSelect = () => {
    setShowImagePicker(true);
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      t('Logout'),
      t('Are you sure you want to logout?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Logout'),
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.replace('Login');
          },
        },
      ],
    );
  };

  // Profile menu items
  const profileMenuItems = [
    {
      id: 'language',
      title: t('Language'),
      subtitle: t('Change app language'),
      icon: 'language',
      iconType: 'material',
      onPress: () => setShowLanguageModal(true),
      showArrow: true,
    },
    {
      id: 'notifications',
      title: t('Notifications'),
      subtitle: t('Manage notification settings'),
      icon: 'notifications',
      iconType: 'material',
      onPress: () => setNotificationsEnabled(!notificationsEnabled),
      showSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled,
    },
    {
      id: 'darkMode',
      title: t('Dark Mode'),
      subtitle: t('Switch to dark theme'),
      icon: 'moon',
      iconType: 'ionicons',
      onPress: () => setDarkModeEnabled(!darkModeEnabled),
      showSwitch: true,
      switchValue: darkModeEnabled,
      onSwitchChange: setDarkModeEnabled,
    },
    {
      id: 'privacy',
      title: t('Privacy & Security'),
      subtitle: t('Manage your privacy settings'),
      icon: 'shield-checkmark',
      iconType: 'ionicons',
      onPress: () => Alert.alert(t('Privacy'), t('Privacy settings coming soon')),
      showArrow: true,
    },
    {
      id: 'help',
      title: t('Help & Support'),
      subtitle: t('Get help and contact support'),
      icon: 'help-circle',
      iconType: 'ionicons',
      onPress: () => Alert.alert(t('Help'), t('Help & support coming soon')),
      showArrow: true,
    },
    {
      id: 'about',
      title: t('About'),
      subtitle: t('App version and information'),
      icon: 'information-circle',
      iconType: 'ionicons',
      onPress: () => Alert.alert(t('About'), 'Hotel Management App v1.0.0'),
      showArrow: true,
    },
  ];

  const renderIcon = (icon, iconType) => {
    const iconProps = { size: 24, color: '#1c2f87' };
    
    if (iconType === 'material') {
      return <MaterialIcons name={icon} {...iconProps} />;
    } else {
      return <Ionicons name={icon} {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        {/* <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Profile')}</Text>
        </View> */}

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={handleImageSelect} activeOpacity={0.8}>
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}
              <View style={styles.editImageButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || t('User Name')}</Text>
            <Text style={styles.userRole}>{user?.role || t('Admin')}</Text>
            <Text style={styles.userEmail}>{user?.email || 'admin@hotel.com'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {profileMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  {renderIcon(item.icon, item.iconType)}
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              
              <View style={styles.menuItemRight}>
                {item.showSwitch && (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{ false: '#e9ecef', true: '#fe8c06' }}
                    thumbColor={item.switchValue ? '#fff' : '#f4f3f4'}
                  />
                )}
                {item.showArrow && (
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>{t('Logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Select Language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.languageOptions}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    i18n.language === language.code && styles.selectedLanguage,
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    i18n.language === language.code && styles.selectedLanguageText,
                  ]}>
                    {language.name}
                  </Text>
                  {i18n.language === language.code && (
                    <Ionicons name="checkmark" size={20} color="#fe8c06" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.imagePickerOverlay}>
          <View style={styles.imagePickerContent}>
            <View style={styles.imagePickerHeader}>
              <Text style={styles.imagePickerTitle}>Select Photo</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imagePickerOptions}>
              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={handleCameraCapture}
              >
                <Ionicons name="camera" size={32} color="#1c2f87" />
                <Text style={styles.imagePickerOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={handleGallerySelect}
              >
                <Ionicons name="images" size={32} color="#1c2f87" />
                <Text style={styles.imagePickerOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    backgroundColor: '#1c2f87',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  profileSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1c2f87',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fe8c06',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#fe8c06',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutSection: {
    margin: 20,
    paddingBottom: 70,
  },
  logoutButton: {
    backgroundColor: '#FE8C06',
    borderRadius: 15,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#FE8C06',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '85%',
    maxHeight: '60%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  languageOptions: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedLanguage: {
    backgroundColor: '#f0f4ff',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  selectedLanguageText: {
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '80%',
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imagePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imagePickerTitle: {
    fontSize: 18,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  imagePickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imagePickerOption: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 120,
  },
  imagePickerOptionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});
