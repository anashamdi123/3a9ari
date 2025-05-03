import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, SafeAreaView, Dimensions, ViewStyle, TextStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '@/constants/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { useProperties } from '@/hooks/useProperties';
import { APP_NAME } from '@/constants/config';
import { Property } from '@/lib/supabase';

export default function HomeScreen() {
  const {
    properties,
    loading,
    searchQuery,
    setSearchQuery,
    refreshing,
    handleRefresh
  } = useProperties();

  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>{APP_NAME}</Text>
        <Text style={styles.tagline}>ابحث عن منزل أحلامك</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setShowFilters(!showFilters)}
        />
      </View>
      
      <FlatList<Property>
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'جاري التحميل...' : 'لا توجد عقارات متاحة'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  logo: TextStyle;
  tagline: TextStyle;
  searchContainer: ViewStyle;
  listContent: ViewStyle;
  columnWrapper: ViewStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  tagline: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  listContent: {
    padding: Theme.spacing.lg,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});