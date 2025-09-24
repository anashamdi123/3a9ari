import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { APP_NAME } from '@/constants/config';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  modal?: boolean;
  showLogo?: boolean;
  onLogoPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  modal = false,
  showLogo = false,
  onLogoPress
}) => {
  const router = useRouter();
  
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  
  const handleLogoPress = () => {
    if (onLogoPress) {
      onLogoPress();
      return;
    }
    // Always try to reload if possible, otherwise navigate home
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    } else {
      router.replace('/');
    }
  };
  
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            {modal ? <X size={24} color={Theme.colors.text.primary} /> : <ArrowLeft size={24} color={Theme.colors.text.primary} />}
          </TouchableOpacity>
        )}
      </View>
      
      {showLogo ? (
        <TouchableOpacity style={styles.logoContainer} onPress={handleLogoPress}>
          <Text style={styles.logo}>{APP_NAME}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      
      <View style={styles.rightContainer}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: Theme.colors.background.main,
    // Add shadow from theme
    ...Theme.shadows.medium,
  } as ViewStyle,
  leftContainer: {
    position: 'absolute',
    left: Theme.spacing.xl,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  rightContainer: {
    position: 'absolute',
    right: Theme.spacing.xl,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  title: {
    fontSize: Theme.fontSizes.xl,
    fontFamily: 'Tajawal-Bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    
  } as TextStyle,
  placeholder: {
    width: 40,
    height: 40,
  } as ViewStyle,
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  logo: {
    // fontFamily: 'Tajawal-Medium',
    fontSize: 40,
    color: Theme.colors.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    fontWeight :"bold" , 
  } as TextStyle,
});