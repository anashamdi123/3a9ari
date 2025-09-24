import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { Theme } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'إبحث عن عنوان أو موقع العقار...'
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Search color={Theme.colors.text.secondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.text.light}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      
      {onFilterPress && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <SlidersHorizontal color={Theme.colors.primary} size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Theme.spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.light,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    width: '100%',
  },
  searchIcon: {
    marginLeft: Theme.spacing.xs,
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    textAlign: 'right',
    paddingVertical: Theme.spacing.sm,
    width: '100%',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});