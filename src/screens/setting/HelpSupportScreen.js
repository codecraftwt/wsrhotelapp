import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function HelpSupportScreen({ navigation }) {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ Data
  const faqData = [
    {
      id: 1,
      question: t('How do I add a new hotel?'),
      answer: t('Go to "All Hotels" from the menu, then tap the "+" button to add a new hotel with all required details.'),
    },
    {
      id: 2,
      question: t('How can I manage employee records?'),
      answer: t('Navigate to "Add Employee" section to add new employees or view existing employee information.'),
    },
    {
      id: 3,
      question: t('How do I create expense entries?'),
      answer: t('Use the "Expense Entry" feature to record and track all hotel-related expenses with proper categorization.'),
    },
    {
      id: 4,
      question: t('How to request materials?'),
      answer: t('Go to "Material Request" section to create new material requests for your hotel operations.'),
    },
    {
      id: 5,
      question: t('How do I view reports?'),
      answer: t('Access the "Reports" section to view detailed analytics, performance metrics, and financial reports.'),
    },
    {
      id: 6,
      question: t('How to manage inventory?'),
      answer: t('Use the "Inventory" section to track stock levels, add new items, and manage your hotel inventory.'),
    },
  ];

  // Contact methods
  const contactMethods = [
    {
      id: 'email',
      title: t('Email Support'),
      subtitle: t('Get help via email'),
      icon: 'mail',
      iconType: 'ionicons',
      action: () => {
        Linking.openURL('mailto:support@hotelmanagement.com?subject=Support Request');
      },
    },
    {
      id: 'phone',
      title: t('Call Support'),
      subtitle: t('Speak with our team'),
      icon: 'call',
      iconType: 'ionicons',
      action: () => {
        Linking.openURL('tel:+1234567890');
      },
    },
    {
      id: 'whatsapp',
      title: t('WhatsApp Support'),
      subtitle: t('Chat with us on WhatsApp'),
      icon: 'logo-whatsapp',
      iconType: 'ionicons',
      action: () => {
        Linking.openURL('whatsapp://send?phone=+1234567890&text=Hello, I need help with the hotel management app.');
      },
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

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
          <Text style={styles.headerTitle}>{t('Help & Support')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="help-circle" size={50} color="#1c2f87" />
          </View>
          <Text style={styles.welcomeTitle}>{t('How can we help you?')}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t('Find answers to common questions or get in touch with our support team')}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Quick Actions')}</Text>
          <View style={styles.quickActions}>
            {contactMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={styles.quickActionItem}
                onPress={method.action}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionIcon}>
                  {renderIcon(method.icon, method.iconType)}
                </View>
                <Text style={styles.quickActionTitle}>{method.title}</Text>
                <Text style={styles.quickActionSubtitle}>{method.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Frequently Asked Questions')}</Text>
          <View style={styles.faqContainer}>
            {faqData.map(faq => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#1c2f87"
                  />
                </TouchableOpacity>
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('App Information')}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('Version')}</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('Last Updated')}</Text>
              <Text style={styles.infoValue}>December 2024</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('Developer')}</Text>
              <Text style={styles.infoValue}>Hotel Management Team</Text>
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
  quickActions: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  quickActionTitle: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  faqContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 10,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  bottomSpacing: {
    height: 20,
  },
}); 