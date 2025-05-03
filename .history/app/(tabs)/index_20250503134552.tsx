import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, SafeAreaView, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '@/constants/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { useProperties } from '@/hooks/useProperties';
import { APP_NAME } from '@/constants/config';
import { Property } from '@/lib/supabase';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const {
    properties,
    loading,
    searchQuery,
    setSearchQuery,
    refreshing,
    handleRefresh,
    handleLoadMore,
    hasMore,
    totalCount
  } = useProperties({
    status: 'approved'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    if (width >= 768) return 3; // Tablet and larger
    if (width >= 480) return 2; // Large phones
    return 1; // Small phones
  }, [width]);

  // Calculate item width based on number of columns and screen width
  const itemWidth = useMemo(() => {
    const horizontalPadding = Theme.spacing.md * 2;
    const gap = Theme.spacing.md;
    return (width - horizontalPadding - (numColumns - 1) * gap) / numColumns;
  }, [width, numColumns]);

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  };

  const renderItem = ({ item }: { item: Property }) => (
    <View style={[styles.itemContainer, { width: itemWidth }]}>
      <PropertyCard property={item} />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? 'جاري التحميل...' : 'لا توجد عقارات متاحة'}
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>{APP_NAME}</Text>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList<Property>
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
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
    padding: Theme.spacing.md,
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
  searchContainer: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  itemContainer: {
    marginBottom: Theme.spacing.md,
  },
  emptyContainer: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
});