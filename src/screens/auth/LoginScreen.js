import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';

export default function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState('en');

  const { loading, error, isLoggedIn } = useSelector(state => state.auth);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'mr' : 'en';
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    const result = await dispatch(login({ username, password }));

    if (login.fulfilled.match(result)) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', result.payload || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.langButton}
          onPress={toggleLanguage}
          activeOpacity={0.7}
        >
          <Icon name="language" size={20} color="#1c2f87" />
          <Text style={styles.langText}>
            {lang === 'en' ? 'मराठी' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('login')}</Text>

          <View style={styles.inputContainer}>
            <Icon name="person" size={22} color="#1c2f87" style={styles.icon} />
            <TextInput
              placeholder={t('username')}
              placeholderTextColor="#a0a3bd"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={22} color="#1c2f87" style={styles.icon} />
            <TextInput
              placeholder={t('password')}
              placeholderTextColor="#a0a3bd"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color="#1c2f87"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('login')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c2f87',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 25,
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: '#1c2f87',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e6e9ff',
    height: 60,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1c2f87',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 5,
  },
  loginButton: {
    backgroundColor: '#fe8c06',
    borderRadius: 15,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    shadowColor: '#fe8c06',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 10,
  },
  footer: {
    marginTop: 50,
    alignItems: 'flex-end',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    borderRadius: 25,
  },
  langText: {
    color: '#1c2f87',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    marginLeft: 10,
  },
});
