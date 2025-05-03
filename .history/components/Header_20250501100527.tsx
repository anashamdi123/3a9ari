import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { Theme } from '@/constants/theme';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  modal?: boolean;
  logo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  modal = false,
  logo = false
}) => {
  const router = useRouter();
  
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
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
      
      {logo ? (
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>{title}</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      
      <View style={styles.rightContainer}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftContainer: {
    width: 40,
  },
  rightContainer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  logo: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
});