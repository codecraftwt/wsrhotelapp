import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, resetChangePasswordState } from '../../redux/slices/changePasswordSlice';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const changeState = useSelector(state => state.changePassword);

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (changeState.success) {
      showSuccessToast('Success', changeState.message || 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      dispatch(resetChangePasswordState());
    } else if (changeState.error) {
      showErrorToast('Error', changeState.error);
    }
  }, [changeState.success, changeState.error]);

  const handleSave = () => {
    if (!email) {
      showErrorToast('Validation', 'Email not available');
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorToast('Validation', 'All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast('Validation', 'New and confirm passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showErrorToast('Validation', 'New password must be at least 8 characters');
      return;
    }

    dispatch(
      changePassword({
        email,
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
    );
  };

  const renderPasswordInput = (label, value, setValue, visible, setVisible) => (
    <View style={styles.fieldWrapper}>
      {/* <Text style={styles.label}>{label}</Text> */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          secureTextEntry={!visible}
          placeholder={label}
          placeholderTextColor="#6c757d"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setVisible(!visible)}>
          <Ionicons name={visible ? 'eye' : 'eye-off'} size={20} color="#1c2f87" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.fieldWrapper}>
          {/* <Text style={styles.label}>Email</Text> */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
              placeholderTextColor="#6c757d"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={false}
            />
          </View>
        </View>

        {renderPasswordInput('Enter Current Password', currentPassword, setCurrentPassword, showCurrent, setShowCurrent)}
        {renderPasswordInput('Enter New Password', newPassword, setNewPassword, showNew, setShowNew)}
        {renderPasswordInput('Enter Confirm Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm)}

        <TouchableOpacity style={[styles.saveBtn, changeState.loading && { opacity: 0.6 }]} onPress={handleSave} activeOpacity={0.9} disabled={changeState.loading}>
          <Text style={styles.saveBtnText}>{changeState.loading ? 'Updating...' : 'Update Password'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  title: {
    fontSize: 20,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  fieldWrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-Regular',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e9ff',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    color: '#1c2f87',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 6,
    marginLeft: 6,
  },
  saveBtn: {
    backgroundColor: '#fe8c06',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#fe8c06',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});



