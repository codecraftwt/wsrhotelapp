import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function AboutScreen({ navigation }) {
  const { t } = useTranslation();

  // App features
  const appFeatures = [
    {
      id: 1,
      title: t('Hotel Management'),
      description: t('Comprehensive hotel management with booking and room tracking'),
      icon: 'business',
      iconType: 'ionicons',
    },
    {
      id: 2,
      title: t('Employee Management'),
      description: t('Manage staff records, roles, and performance tracking'),
      icon: 'people',
      iconType: 'ionicons',
    },
    {
      id: 3,
      title: t('Expense Tracking'),
      description: t('Track and categorize all hotel-related expenses'),
      icon: 'receipt',
      iconType: 'material',
    },
    {
      id: 4,
      title: t('Inventory Management'),
      description: t('Monitor stock levels and manage hotel inventory'),
      icon: 'cube',
      iconType: 'ionicons',
    },
    {
      id: 5,
      title: t('Material Requests'),
      description: t('Create and track material requests for operations'),
      icon: 'list',
      iconType: 'ionicons',
    },
    {
      id: 6,
      title: t('Reports & Analytics'),
      description: t('Generate detailed reports and performance analytics'),
      icon: 'analytics',
      iconType: 'material',
    },
  ];

  // Team information
  const teamInfo = [
    {
      id: 1,
      name: t('Development Team'),
      role: t('Software Development'),
      description: t('Expert developers creating innovative hotel management solutions'),
    },
    {
      id: 2,
      name: t('Design Team'),
      role: t('UI/UX Design'),
      description: t('Creative designers ensuring excellent user experience'),
    },
    {
      id: 3,
      name: t('Support Team'),
      role: t('Customer Support'),
      description: t('Dedicated support team available 24/7 for assistance'),
    },
  ];

  // Social links
  const socialLinks = [
    {
      id: 'website',
      title: t('Visit Website'),
      icon: 'globe',
      iconType: 'ionicons',
      action: () => {
        Linking.openURL('https://hotelmanagement.com');
      },
    },
    {
      id: 'email',
      title: t('Contact Us'),
      icon: 'mail',
      iconType: 'ionicons',
      action: () => {
        Linking.openURL('mailto:info@hotelmanagement.com');
      },
    },
    {
      id: 'privacy',
      title: t('Privacy Policy'),
      icon: 'shield-checkmark',
      iconType: 'ionicons',
      action: () => {
        Linking.openURL('https://hotelmanagement.com/privacy');
      },
    },
    {
      id: 'terms',
      title: t('Terms of Service'),
      icon: 'document-text',
      iconType: 'ionicons',
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
          <Text style={styles.headerTitle}>{t('About')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* App Logo and Info */}
        <View style={styles.appInfoSection}>
          <Image
            source={require('../../assets/walstar-logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Hotel Management App</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            {t('Comprehensive hotel management solution designed to streamline operations, enhance guest experience, and maximize profitability.')}
          </Text>
        </View>

        {/* App Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Key Features')}</Text>
          <View style={styles.featuresContainer}>
            {appFeatures.map(feature => (
              <View key={feature.id} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  {renderIcon(feature.icon, feature.iconType)}
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Team Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Our Team')}</Text>
          <View style={styles.teamContainer}>
            {teamInfo.map(team => (
              <View key={team.id} style={styles.teamItem}>
                <View style={styles.teamIcon}>
                  <Ionicons name="people" size={24} color="#1c2f87" />
                </View>
                <View style={styles.teamContent}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamRole}>{team.role}</Text>
                  <Text style={styles.teamDescription}>
                    {team.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* App Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('App Statistics')}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>{t('Hotels')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>{t('Users')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>99.9%</Text>
              <Text style={styles.statLabel}>{t('Uptime')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Quick Links')}</Text>
          <View style={styles.linksContainer}>
            {socialLinks.map(link => (
              <TouchableOpacity
                key={link.id}
                style={styles.linkItem}
                onPress={link.action}
                activeOpacity={0.7}
              >
                <View style={styles.linkIcon}>
                  {renderIcon(link.icon, link.iconType)}
                </View>
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 Hotel Management App. {t('All rights reserved.')}
          </Text>
          <Text style={styles.copyrightSubtext}>
            {t('Built with ❤️ for the hospitality industry')}
          </Text>
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
  appInfoSection: {
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
  appLogo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    color: '#fe8c06',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15,
  },
  appDescription: {
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
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  teamContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  teamContent: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 14,
    color: '#fe8c06',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  linksContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  linkTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  copyrightText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 5,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#adb5bd',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
}); 