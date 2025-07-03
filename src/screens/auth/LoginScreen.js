import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
  Image,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import api from '../../api/axiosInstance';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState('en');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const { loading, error, isLoggedIn } = useSelector(state => state.auth);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoPosition = useRef(new Animated.Value(height * 0.15)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.7,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(logoPosition, {
            toValue: height * 0.05,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(logoPosition, {
            toValue: height * 0.15,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'mr' : 'en';
    setLang(newLang);
    i18n.changeLanguage(newLang);

    // Add animation feedback
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(t('error'), t('enter_credentials'));
      return;
    }

    const result = await dispatch(login({ username, password }));

    if (login.fulfilled.match(result)) {
      // Set the token in axios headers for future requests
      if (result.payload.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${result.payload.token}`;
      }
      navigation.replace('Main');
    } else {
      Alert.alert(
        t('login_failed'),
        result.payload || t('invalid_credentials'),
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Language Toggle */}
      <Animated.View
        style={[
          styles.langContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity
          style={styles.langButton}
          onPress={toggleLanguage}
          activeOpacity={0.7}
        >
          <Icon name="language" size={20} color="#fff" />
          <Text style={styles.langText}>
            {lang === 'en' ? 'मराठी' : 'English'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Logo */}
      <Animated.Image
        source={require('../../assets/loginlogo.png')}
        style={[
          styles.logo,
          {
            transform: [{ translateY: logoPosition }, { scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />

      {/* Form Container */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{t('login')}</Text>

          {/* Username Field */}
          <View style={styles.inputContainer}>
            <Icon name="person" size={22} color="#1c2f87" style={styles.icon} />
            <TextInput
              placeholder={t('Enter Username')}
              placeholderTextColor="#a0a3bd"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={22} color="#1c2f87" style={styles.icon} />
            <TextInput
              placeholder={t('Enter Password')}
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

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert(t('reset_password'), t('contact_admin'))}
          >
            <Text style={styles.forgotText}>{t('Forgot Password')}</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{t('login')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Footer */}
      {!isKeyboardVisible && (
        <Animated.View
          style={[
            styles.footer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.footerText}>© 2023 Walstar Hospitality</Text>
          {/* <Text style={styles.footerText}>v1.0.0</Text> */}
        </Animated.View>
      )}
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
  langContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  langText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
  logo: {
    width: 250,
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 25,
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 15,
  },
  forgotText: {
    color: '#fe8c06',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  loginButton: {
    backgroundColor: '#fe8c06',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#fe8c06',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
});
