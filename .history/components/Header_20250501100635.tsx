import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, X } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { APP_NAME } from '@/constants/config';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  modal?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  modal = false,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowRight size={24} color={Theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.logo}>{APP_NAME}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        {rightComponent || <View style={styles.rightPlaceholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
});