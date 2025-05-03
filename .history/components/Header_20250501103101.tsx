import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, X } from 'lucide-react-native';
import { Theme } from '@/constants/theme';

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
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowRight size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
      )}
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
      
      {modal && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: Theme.spacing.md,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    textAlign: 'right',
  },
  rightComponent: {
    marginLeft: Theme.spacing.md,
  },
  closeButton: {
    padding: Theme.spacing.sm,
  },
});