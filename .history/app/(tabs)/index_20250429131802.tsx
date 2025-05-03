import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, SafeAreaView, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '@/constants/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { useProperties } from '@/hooks/useProperties';
import { APP_NAME } from '@/constants/config';

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
  const { width } = useWindowDimensions();
  
  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    if (width >= 768) return 3; // Tablet and larger
    if (width >= 480) return 2; // Large phones
    return 1; // Small phones
  }, [width]);
  
  // Calculate item width based on number of columns
  const itemWidth = useMemo(() => {
    const horizontalPadding = Theme.spacing.md * 2;
    const gap = Theme.spacing.sm * (numColumns - 1);
    return (width - horizontalPadding - gap) / numColumns;
  }, [width, numColumns]);
  
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
      
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.cardContainer, { width: itemWidth }]}>
            <PropertyCard property={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
        numColumns={numColumns}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  logo: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxxl,
    color: Theme.colors.primary,
    textAlign: 'right',
  },
  tagline: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'right',
    marginTop: Theme.spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.md,
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  cardContainer: {
    marginBottom: Theme.spacing.md,
  },
  emptyContainer: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});