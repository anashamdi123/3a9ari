import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Theme } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}) => {
  const buttonStyles = [
    styles.button,
    styles[`${type}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`${type}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={type === 'primary' ? 'white' : Theme.colors.primary} 
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.md,
  },
  
  // Button types
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.accent,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  
  // Button sizes
  smallButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
  },
  mediumButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  largeButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
  },
  
  // Text styling
  text: {
    fontFamily: 'Tajawal-Medium',
    textAlign: 'center',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: Theme.colors.text.primary,
  },
  outlineText: {
    color: Theme.colors.primary,
  },
  textText: {
    color: Theme.colors.primary,
  },
  
  // Text sizes
  smallText: {
    fontSize: Theme.fontSizes.xs,
  },
  mediumText: {
    fontSize: Theme.fontSizes.sm,
  },
  largeText: {
    fontSize: Theme.fontSizes.md,
  },
  
  // Disabled state
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});