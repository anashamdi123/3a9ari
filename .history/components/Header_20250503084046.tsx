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
}

export const  Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  modal = false
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
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor:'red' , 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
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
  placeholder: {
    width: 40,
  },
});