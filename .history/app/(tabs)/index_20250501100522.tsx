import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '@/constants/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { useProperties } from '@/hooks/useProperties';
import { APP_NAME } from '@/constants/config';
import { Property } from '@/lib/supabase';
import { Header } from '@/components/Header';

export default function HomeScreen() {
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
  } = useProperties();

  const [showFilters, setShowFilters] = useState(false);

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Header title={APP_NAME} logo={true} showBackButton={false} />
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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