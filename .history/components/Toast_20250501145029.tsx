import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Theme } from '@/constants/theme';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: type === 'success' ? Theme.colors.success : Theme.colors.error,
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  message: {
    color: 'white',
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    textAlign: 'center',
  },
}); 