import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../redux/slices/forgotPasswordSlice';
import Toast from 'react-native-toast-message';
import { Colors } from '../../assets/globleStyles/colors';

export default function ResetPasswordScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { resetting } = useSelector(state => state.forgotPassword);
  const emailFromParams = route?.params?.email || '';

  const [email, setEmail] = useState(emailFromParams);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSubmit = async () => {
    if (!email.trim() || !token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Toast.show({ type: 'error', position: 'top', text1: 'Error', text2: 'All fields are required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', position: 'top', text1: 'Error', text2: 'Passwords do not match' });
      return;
    }
    const resultAction = await dispatch(
      resetPassword({ email, token, new_password: newPassword, confirm_password: confirmPassword })
    );
    if (resetPassword.fulfilled.match(resultAction)) {
      Toast.show({ type: 'success', position: 'top', text1: 'Success', text2: resultAction.payload?.message || 'Password reset successfully' });
      navigation.replace('Login');
    } else {
      Toast.show({ type: 'error', position: 'top', text1: 'Error', text2: resultAction.payload || 'Failed to reset password' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter the token sent to your email and set a new password</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Email'
              placeholderTextColor={Colors.gray}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Token'
              placeholderTextColor={Colors.gray}
              style={styles.input}
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder='New Password'
              placeholderTextColor={Colors.gray}
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Confirm Password'
              placeholderTextColor={Colors.gray}
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={[styles.button, resetting && styles.buttonDisabled]} onPress={onSubmit} disabled={resetting}>
            <Text style={styles.buttonText}>{resetting ? 'Please wait...' : 'Reset Password'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Back</Text>
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
    marginTop: 16,
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


