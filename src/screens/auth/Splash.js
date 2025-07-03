import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, Animated, Easing } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyToken, setInitialized } from '../../redux/slices/authSlice';

export default function Splash({ navigation }) {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);
  const dispatch = useDispatch();
  const { token, isLoggedIn, isInitialized } = useSelector(state => state.auth);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      // Scale up animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    ]).start();

    // Check authentication status after animations start
    const checkAuthStatus = async () => {
      try {
        // If we have a token, verify it
        if (token) {
          await dispatch(verifyToken()).unwrap();
        } else {
          // No token, mark as initialized and go to login
          dispatch(setInitialized());
        }
      } catch (error) {
        // If verification fails, mark as initialized and go to login
        dispatch(setInitialized());
      }
    };

    // Start auth check after animations
    const authTimer = setTimeout(() => {
      checkAuthStatus();
    }, 2000);

    // Fallback timer in case something goes wrong
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        dispatch(setInitialized());
      }
    }, 5000);

    return () => {
      clearTimeout(authTimer);
      clearTimeout(fallbackTimer);
    };
  }, [dispatch, token, isInitialized]);

  // Navigate based on auth state when initialized
  useEffect(() => {
    if (isInitialized) {
      const navigateTimer = setTimeout(() => {
        navigation.replace(isLoggedIn ? 'Main' : 'Login');
      }, 1000);
      
      return () => clearTimeout(navigateTimer);
    }
  }, [isInitialized, isLoggedIn, navigation]);

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Image
          source={require('../../assets/splashlogo.png')}
          style={[styles.logo]}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Hotel Management</Text>
        <Text style={styles.subtitle}>Premium Hospitality Solutions</Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                transform: [
                  {
                    scaleX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c2f87',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -150,
    left: -50,
  },
  circle2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -250,
    right: -100,
  },
  circle3: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(254, 140, 6, 0.05)',
    top: '30%',
    right: -100,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 350,

    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins-Medium',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: '60%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fe8c06',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins-Regular',
  },
});
