import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle, AccessibilityProps } from 'react-native';
import { Theme } from '@/constants/theme';

interface LoadingIndicatorProps extends AccessibilityProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

const SIZE_MAP = {
  small: 24,
  medium: 36,
  large: 48,
};

function LoadingIndicator({
  size = 'medium',
  color = Theme.colors.primary,
  style,
  accessibilityLabel = 'Loading',
  ...rest
}: LoadingIndicatorProps) {
  return (
    <View
      style={[
        styles.container,
        styles[`shadow_${size}`],
        style,
      ]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      <ActivityIndicator
        size={SIZE_MAP[size]}
        color={color}
        style={styles.indicator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
  shadow_small: {
    ...Theme.shadows.small,
  },
  shadow_medium: {
    ...Theme.shadows.medium,
  },
  shadow_large: {
    ...Theme.shadows.large,
  },
  indicator: {
    alignSelf: 'center',
  },
});

export { LoadingIndicator }; 