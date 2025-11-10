import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset } from '../../redux/slices/forgotPasswordSlice';
import { Colors } from '../../assets/globleStyles/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { requesting } = useSelector(state => state.forgotPassword);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', position: 'top', text1: 'Error', text2: 'Please enter your email' });
      return;
    }
    try {
      setSubmitting(true);
      const result = await dispatch(requestPasswordReset(email));
      if (requestPasswordReset.fulfilled.match(result)) {
        Toast.show({ type: 'success', position: 'top', text1: 'Reset link sent', text2: 'Check your inbox' });
        // navigation.navigate('ResetPassword', { email });
        navigation.navigate('Login')
      } else {
        Toast.show({ type: 'error', position: 'top', text1: 'Error', text2: result.payload || 'Failed to send reset link' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your registered email</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Enter your email'
              placeholderTextColor={Colors.gray}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <TouchableOpacity style={[styles.button, (submitting || requesting) && styles.buttonDisabled]} onPress={handleSubmit} activeOpacity={0.9} disabled={submitting || requesting}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.darkBlue,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.darkBlue,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 20,
    backgroundColor: Colors.veryLightBlue,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.paleBlue,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.darkBlue,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.orange,
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  link: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.darkBlue,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});


