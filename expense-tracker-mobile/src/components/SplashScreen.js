import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const { colors } = useTheme();
  
  // Wallet animation
  const walletScale = useRef(new Animated.Value(0)).current;
  const walletRotate = useRef(new Animated.Value(0)).current;
  const walletGlow = useRef(new Animated.Value(0)).current;
  const walletFloat = useRef(new Animated.Value(0)).current;
  
  // Cash bills animations (multiple bills peeping out)
  const cash1 = useRef(new Animated.Value(0)).current;
  const cash2 = useRef(new Animated.Value(0)).current;
  const cash3 = useRef(new Animated.Value(0)).current;
  const cash4 = useRef(new Animated.Value(0)).current;
  const cash5 = useRef(new Animated.Value(0)).current;
  
  // Cash bills stay visible animation (bounce effect)
  const cash1Bounce = useRef(new Animated.Value(1)).current;
  const cash2Bounce = useRef(new Animated.Value(1)).current;
  const cash3Bounce = useRef(new Animated.Value(1)).current;
  const cash4Bounce = useRef(new Animated.Value(1)).current;
  const cash5Bounce = useRef(new Animated.Value(1)).current;
  
  // Cash bills floating/swaying movement
  const cash1Float = useRef(new Animated.Value(0)).current;
  const cash2Float = useRef(new Animated.Value(0)).current;
  const cash3Float = useRef(new Animated.Value(0)).current;
  const cash4Float = useRef(new Animated.Value(0)).current;
  const cash5Float = useRef(new Animated.Value(0)).current;
  
  // Cash bills rotation movement
  const cash1Rotate = useRef(new Animated.Value(0)).current;
  const cash2Rotate = useRef(new Animated.Value(0)).current;
  const cash3Rotate = useRef(new Animated.Value(0)).current;
  const cash4Rotate = useRef(new Animated.Value(0)).current;
  const cash5Rotate = useRef(new Animated.Value(0)).current;
  
  // App name fade in
  const appNameOpacity = useRef(new Animated.Value(0)).current;
  const appNameScale = useRef(new Animated.Value(0.8)).current;
  
  // Background particles
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wallet entrance animation
    Animated.parallel([
      Animated.spring(walletScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(walletRotate, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(walletRotate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(walletGlow, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(walletGlow, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
      // Wallet floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(walletFloat, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(walletFloat, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Cash bills peeping out animation (staggered with longer duration)
    const cashAnimation = (animValue, delay) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.spring(animValue, {
          toValue: 1,
          tension: 35,
          friction: 5,
          useNativeDriver: true,
        }),
      ]);
    };

    // Start cash animations
    Animated.parallel([
      cashAnimation(cash1, 300),
      cashAnimation(cash2, 500),
      cashAnimation(cash3, 700),
      cashAnimation(cash4, 900),
      cashAnimation(cash5, 1100),
    ]).start();

    // Cash bills bounce animation (keeps them visible and animated)
    const createBounceAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Cash bills floating animation (up and down movement)
    const createFloatAnimation = (animValue, delay, amplitude) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1500 + amplitude * 200,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1500 + amplitude * 200,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Cash bills rotation animation (subtle swaying)
    const createRotateAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start bounce animations after cash appears
    setTimeout(() => {
      createBounceAnimation(cash1Bounce, 0).start();
      createBounceAnimation(cash2Bounce, 200).start();
      createBounceAnimation(cash3Bounce, 400).start();
      createBounceAnimation(cash4Bounce, 600).start();
      createBounceAnimation(cash5Bounce, 800).start();
      
      // Start floating animations
      createFloatAnimation(cash1Float, 0, 1).start();
      createFloatAnimation(cash2Float, 300, 2).start();
      createFloatAnimation(cash3Float, 600, 1.5).start();
      createFloatAnimation(cash4Float, 900, 2.5).start();
      createFloatAnimation(cash5Float, 1200, 1.8).start();
      
      // Start rotation animations
      createRotateAnimation(cash1Rotate, 0).start();
      createRotateAnimation(cash2Rotate, 400).start();
      createRotateAnimation(cash3Rotate, 800).start();
      createRotateAnimation(cash4Rotate, 1200).start();
      createRotateAnimation(cash5Rotate, 1600).start();
    }, 1500);

    // Background particles
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(particle1, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle2, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(particle2, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle3, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(particle3, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // App name animation (delayed to show after cash)
    Animated.parallel([
      Animated.timing(appNameOpacity, {
        toValue: 1,
        duration: 800,
        delay: 1800,
        useNativeDriver: true,
      }),
      Animated.spring(appNameScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 1800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const walletRotation = walletRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });

  const walletGlowOpacity = walletGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const walletFloatY = walletFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  // Cash bill positions (peeping out from wallet with longer animation)
  const getCashTransform = (animValue, bounceValue, floatValue, rotateValue, offsetX, offsetY, rotationDeg) => {
    const translateX = animValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, offsetX * 0.5, offsetX],
    });
    
    // Base Y position from peeping animation
    const baseTranslateY = animValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, offsetY * 0.5, offsetY],
    });
    
    // Floating movement (up and down)
    const floatY = floatValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -12],
    });
    
    // Combine base Y with floating movement
    const translateY = Animated.add(baseTranslateY, floatY);
    
    // Base rotation from peeping animation with subtle swaying
    // Combine base rotation with swaying by adjusting the output range
    const rotate = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        `${rotationDeg * 0 - 3}deg`,
        `${rotationDeg * 0.7}deg`,
        `${rotationDeg + 3}deg`
      ],
    });
    
    const scale = animValue.interpolate({
      inputRange: [0, 0.4, 0.7, 1],
      outputRange: [0, 0.6, 0.9, 1],
    });

    // Combine scale animations properly
    const combinedScale = Animated.multiply(scale, bounceValue);

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate },
        { scale: combinedScale },
      ],
      opacity: animValue,
    };
  };

  // Particle animations
  const particle1Y = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.3, height * 0.7],
  });
  const particle1Opacity = particle1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 0],
  });

  const particle2Y = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.5, height * 0.2],
  });
  const particle2Opacity = particle2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 0],
  });

  const particle3Y = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.4, height * 0.8],
  });
  const particle3Opacity = particle3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.4, 0],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0ea5e9', '#0284c7', '#0369a1']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Background particles */}
      <Animated.View
        style={[
          styles.particle,
          styles.particle1,
          {
            opacity: particle1Opacity,
            transform: [{ translateY: particle1Y }],
          },
        ]}
      >
        <Ionicons name="cash" size={30} color="rgba(255, 255, 255, 0.3)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.particle,
          styles.particle2,
          {
            opacity: particle2Opacity,
            transform: [{ translateY: particle2Y }],
          },
        ]}
      >
        <Ionicons name="cash" size={25} color="rgba(255, 255, 255, 0.25)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.particle,
          styles.particle3,
          {
            opacity: particle3Opacity,
            transform: [{ translateY: particle3Y }],
          },
        ]}
      >
        <Ionicons name="cash" size={35} color="rgba(255, 255, 255, 0.2)" />
      </Animated.View>

      <View style={styles.animationContainer}>
        {/* Wallet with glow effect */}
        <Animated.View
          style={[
            styles.walletGlow,
            {
              opacity: walletGlowOpacity,
              transform: [{ scale: walletScale }],
            },
          ]}
        >
          <Ionicons name="wallet" size={140} color="rgba(255, 255, 255, 0.4)" />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.walletContainer,
            {
              transform: [
                { scale: walletScale },
                { rotate: walletRotation },
                { translateY: walletFloatY },
              ],
            },
          ]}
        >
          <Ionicons name="wallet" size={120} color="#ffffff" />
        </Animated.View>

        {/* Cash Bills Peeping Out - More bills, better positioned */}
        <Animated.View
          style={[
            styles.cashBill,
            styles.cash1,
            getCashTransform(cash1, cash1Bounce, cash1Float, cash1Rotate, 30, -20, 18),
          ]}
        >
          <LinearGradient
            colors={['#10b981', '#059669', '#047857']}
            style={styles.bill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.billContent}>
              <Text style={styles.billDollar}>₹</Text>
              <View style={styles.billLines} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.cashBill,
            styles.cash2,
            getCashTransform(cash2, cash2Bounce, cash2Float, cash2Rotate, 45, -30, -12),
          ]}
        >
          <LinearGradient
            colors={['#10b981', '#059669', '#047857']}
            style={styles.bill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.billContent}>
              <Text style={styles.billDollar}>₹</Text>
              <View style={styles.billLines} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.cashBill,
            styles.cash3,
            getCashTransform(cash3, cash3Bounce, cash3Float, cash3Rotate, 25, -25, 22),
          ]}
        >
          <LinearGradient
            colors={['#10b981', '#059669', '#047857']}
            style={styles.bill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.billContent}>
              <Text style={styles.billDollar}>₹</Text>
              <View style={styles.billLines} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.cashBill,
            styles.cash4,
            getCashTransform(cash4, cash4Bounce, cash4Float, cash4Rotate, 40, -35, -18),
          ]}
        >
          <LinearGradient
            colors={['#10b981', '#059669', '#047857']}
            style={styles.bill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.billContent}>
              <Text style={styles.billDollar}>₹</Text>
              <View style={styles.billLines} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.cashBill,
            styles.cash5,
            getCashTransform(cash5, cash5Bounce, cash5Float, cash5Rotate, 35, -28, 15),
          ]}
        >
          <LinearGradient
            colors={['#10b981', '#059669', '#047857']}
            style={styles.bill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.billContent}>
              <Text style={styles.billDollar}>₹</Text>
              <View style={styles.billLines} />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* App Name */}
      <Animated.View
        style={[
          styles.appNameContainer,
          {
            opacity: appNameOpacity,
            transform: [{ scale: appNameScale }],
          },
        ]}
      >
        <View style={styles.appNameWrapper}>
          <Text style={styles.appName}>Expense Tracker</Text>
          <View style={styles.underline} />
        </View>
        <Text style={styles.tagline}>Track Your Finances Smartly</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    position: 'relative',
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletGlow: {
    position: 'absolute',
    zIndex: 0,
  },
  walletContainer: {
    position: 'absolute',
    zIndex: 1,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cashBill: {
    position: 'absolute',
    zIndex: 2,
  },
  cash1: {
    top: 45,
    left: 70,
  },
  cash2: {
    top: 30,
    left: 85,
  },
  cash3: {
    top: 55,
    left: 75,
  },
  cash4: {
    top: 35,
    left: 90,
  },
  cash5: {
    top: 50,
    left: 80,
  },
  bill: {
    width: 50,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#047857',
    overflow: 'hidden',
  },
  billContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  billDollar: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 1,
  },
  billLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  particle: {
    position: 'absolute',
  },
  particle1: {
    left: width * 0.2,
  },
  particle2: {
    right: width * 0.25,
  },
  particle3: {
    left: width * 0.6,
  },
  appNameContainer: {
    marginTop: 120,
    alignItems: 'center',
  },
  appNameWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  underline: {
    width: 120,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginTop: 8,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

export default SplashScreen;
