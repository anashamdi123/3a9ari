import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useToast, ToastVariant } from './use-toast';
import { Theme } from '@/constants/theme';

export function Toast() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <Animated.View
          key={toast.id}
          style={[
            styles.toast,
            toast.variant === 'destructive' && styles.destructive,
          ]}
        >
          <Text style={styles.title}>{toast.title}</Text>
          {toast.description && (
            <Text style={styles.description}>{toast.description}</Text>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destructive: {
    backgroundColor: Theme.colors.destructive,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.foreground,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: Theme.colors.foreground,
    marginTop: Theme.spacing.xs,
    textAlign: 'right',
  },
}); 