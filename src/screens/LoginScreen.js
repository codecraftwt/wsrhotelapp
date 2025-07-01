import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'mr' : 'en';
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleLogin = () => {
    // Replace with real API call
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/walstar-logo.png')} style={styles.logo} />
      <Text style={styles.title}>{t('login')}</Text>

      <TextInput
        placeholder={t('username')}
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder={t('password')}
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t('login')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
        <Text style={styles.langText}>{lang === 'en' ? 'मराठी' : 'English'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#FFFFFF' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20, color: '#1B3A8B' },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#F36F21',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
  langToggle: { marginTop: 20, alignSelf: 'center' },
  langText: { color: '#1B3A8B', fontWeight: '600' },
});
