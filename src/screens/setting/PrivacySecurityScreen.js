import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function PrivacySecurityScreen({ navigation }) {
  const { t } = useTranslation();

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    analytics: true,
    crashReports: false,
    marketingEmails: false,
    pushNotifications: true,
    locationServices: false,
    biometricAuth: true,
    autoLock: true,
    dataBackup: true,
  });

  // Security settings
  const securitySettings = [
    {
      id: 'biometricAuth',
      title: t('Biometric Authentication'),
      subtitle: t('Use fingerprint or face ID to unlock app'),
      icon: 'finger-print',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.biometricAuth,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, biometricAuth: value }));
        if (value) {
          Alert.alert(t('Biometric Auth'), t('Biometric authentication enabled'));
        }
      },
    },
    {
      id: 'autoLock',
      title: t('Auto Lock'),
      subtitle: t('Automatically lock app after inactivity'),
      icon: 'lock',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.autoLock,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, autoLock: value }));
      },
    },
    {
      id: 'dataBackup',
      title: t('Data Backup'),
      subtitle: t('Automatically backup your data'),
      icon: 'cloud-upload',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.dataBackup,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, dataBackup: value }));
      },
    },
  ];

  // Privacy settings
  const privacyOptions = [
    {
      id: 'dataCollection',
      title: t('Data Collection'),
      subtitle: t('Allow app to collect usage data'),
      icon: 'analytics',
      iconType: 'material',
      type: 'switch',
      value: privacySettings.dataCollection,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, dataCollection: value }));
      },
    },
    {
      id: 'analytics',
      title: t('Analytics'),
      subtitle: t('Help improve app with anonymous analytics'),
      icon: 'bar-chart',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.analytics,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, analytics: value }));
      },
    },
    {
      id: 'crashReports',
      title: t('Crash Reports'),
      subtitle: t('Send crash reports to help fix issues'),
      icon: 'bug',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.crashReports,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, crashReports: value }));
      },
    },
    {
      id: 'marketingEmails',
      title: t('Marketing Emails'),
      subtitle: t('Receive promotional emails and updates'),
      icon: 'mail',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.marketingEmails,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, marketingEmails: value }));
      },
    },
    {
      id: 'pushNotifications',
      title: t('Push Notifications'),
      subtitle: t('Receive important app notifications'),
      icon: 'notifications',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.pushNotifications,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, pushNotifications: value }));
      },
    },
    {
      id: 'locationServices',
      title: t('Location Services'),
      subtitle: t('Allow app to access your location'),
      icon: 'location',
      iconType: 'ionicons',
      type: 'switch',
      value: privacySettings.locationServices,
      onValueChange: (value) => {
        setPrivacySettings(prev => ({ ...prev, locationServices: value }));
      },
    },
  ];

  // Data management options
  const dataManagementOptions = [
    {
      id: 'exportData',
      title: t('Export Data'),
      subtitle: t('Download your data as CSV file'),
      icon: 'download',
      iconType: 'ionicons',
      type: 'action',
      action: () => {
        Alert.alert(t('Export Data'), t('Data export feature coming soon'));
      },
    },
    {
      id: 'deleteData',
      title: t('Delete Data'),
      subtitle: t('Permanently delete your account data'),
      icon: 'trash',
      iconType: 'ionicons',
      type: 'action',
      action: () => {
        Alert.alert(
          t('Delete Data'),
          t('Are you sure you want to delete all your data? This action cannot be undone.'),
          [
            { text: t('Cancel'), style: 'cancel' },
            { 
              text: t('Delete'), 
              style: 'destructive',
              onPress: () => {
                Alert.alert(t('Data Deleted'), t('Your data has been deleted successfully'));
              }
            },
          ]
        );
      },
    },
    {
      id: 'privacyPolicy',
      title: t('Privacy Policy'),
      subtitle: t('Read our privacy policy'),
      icon: 'document-text',
      iconType: 'ionicons',
      type: 'action',
      action: () => {
        Linking.openURL('https://hotelmanagement.com/privacy');
      },
    },
    {
      id: 'termsOfService',
      title: t('Terms of Service'),
      subtitle: t('Read our terms of service'),
      icon: 'document',
      iconType: 'ionicons',
      type: 'action',
      action: () => {
        Linking.openURL('https://hotelmanagement.com/terms');
      },
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

  const renderSettingItem = (item) => {
    return (
      <View key={item.id} style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            {renderIcon(item.icon, item.iconType)}
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={styles.settingRight}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#e9ecef', true: '#fe8c06' }}
              thumbColor={item.value ? '#fff' : '#f4f3f4'}
            />
          )}
          {item.type === 'action' && (
            <TouchableOpacity onPress={item.action} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Privacy & Security')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="shield-checkmark" size={50} color="#1c2f87" />
          </View>
          <Text style={styles.welcomeTitle}>{t('Your Privacy Matters')}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t('Control your data and security settings to protect your information')}
          </Text>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Security Settings')}</Text>
          <View style={styles.settingsContainer}>
            {securitySettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Privacy Settings')}</Text>
          <View style={styles.settingsContainer}>
            {privacyOptions.map(renderSettingItem)}
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Data Management')}</Text>
          <View style={styles.settingsContainer}>
            {dataManagementOptions.map(renderSettingItem)}
          </View>
        </View>

        {/* Privacy Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Privacy Tips')}</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipText}>{t('Enable biometric authentication for enhanced security')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipText}>{t('Regularly review and update your privacy settings')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipText}>{t('Keep your app updated for the latest security features')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipText}>{t('Use strong passwords and enable two-factor authentication')}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  placeholder: {
    width: 34,
  },
  welcomeSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeIcon: {
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 22,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
    marginBottom: 15,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  settingRight: {
    alignItems: 'center',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginLeft: 10,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
}); 