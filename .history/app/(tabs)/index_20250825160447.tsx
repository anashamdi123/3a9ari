import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  RefreshControl, 
  SafeAreaView, 
  ActivityIndicator,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { useProperties } from '@/hooks/useProperties';
import { Header } from '@/components/Header';
import { Theme } from '@/constants/theme';
import { X, Search, ChevronDown } from 'lucide-react-native';
import { PROPERTY_CATEGORIES, LOCATIONS, LocationType } from '@/constants/config';
import type { UsePropertiesOptions } from '@/hooks/useProperties';

export default function HomeScreen() {
  const [reloadKey, setReloadKey] = React.useState(0);
  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedCity, setSelectedCity] = React.useState<LocationType | null>(null);
  const [selectedDelegation, setSelectedDelegation] = React.useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
  const [showCityModal, setShowCityModal] = React.useState(false);
  const [showDelegationModal, setShowDelegationModal] = React.useState(false);
  const [filters, setFilters] = React.useState<UsePropertiesOptions>({ category: undefined, city: undefined, delegation: undefined });
  const [filtersLoaded, setFiltersLoaded] = React.useState(false);

  const {
    properties,
    loading,
    searchQuery,
    setSearchQuery,
    refreshing,
    handleRefresh,
    handleLoadMore,
    hasMore
  } = useProperties({ status: 'approved', ...filters });

  const numColumns = 1;

  // Load filters from AsyncStorage on mount
  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('savedFilters');
        if (saved) {
          setFilters(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      } finally {
        setFiltersLoaded(true);
      }
    })();
  }, []);

  // Persist filters to AsyncStorage whenever they change
  React.useEffect(() => {
    if (filtersLoaded) {
      AsyncStorage.setItem('savedFilters', JSON.stringify(filters));
    }
  }, [filters, filtersLoaded]);

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {'لا توجد عقارات متاحة'}
      </Text>
    </View>
  );
  if (!filtersLoaded) {
    return (
      <SafeAreaView style={styles.container} key={reloadKey}>
        <Header showLogo showBackButton={false} onLogoPress={() => setReloadKey(k => k + 1)} />
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.advancedSearchButton}
            onPress={() => setShowAdvancedSearch(true)} 
          >
            <Search size={20} color="white" style={styles.advancedSearchIcon} />
            <Text style={styles.advancedSearchButtonText}>بحث متقدم</Text>
          </TouchableOpacity>
          {/* Active Filters Row (Main View) */}
          <View style={styles.activeFiltersRow}>
            {filters.category && (
              <View style={styles.activeFilterButton}>
                <Text style={styles.activeFilterText}>
                  النوع: {PROPERTY_CATEGORIES.find(c => c.id === filters.category)?.label}
                </Text>
              </View>
            )}
            {filters.city && (
              <View style={styles.activeFilterButton}>
                <Text style={styles.activeFilterText}>المدينة: {filters.city}</Text>
              </View>
            )}
            {filters.delegation && filters.city && (
              <View style={styles.activeFilterButton}>
                <Text style={styles.activeFilterText}>المعتمدية: {filters.delegation}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  if (loading && properties.length === 0) {
    return (
      <SafeAreaView style={styles.container} key={reloadKey}>
        <Header showLogo showBackButton={false} onLogoPress={() => setReloadKey(k => k + 1)} />
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.advancedSearchButton}
            onPress={() => setShowAdvancedSearch(true)} 
          >
            <Search size={20} color="white" style={styles.advancedSearchIcon} />
            <Text style={styles.advancedSearchButtonText}>بحث متقدم</Text>
          </TouchableOpacity>
          {/* Active Filters Row (Main View) */}
          <View style={styles.activeFiltersRow}>
            {filters.category && (
              <View style={styles.activeFilterButton}>
                <Text style={styles.activeFilterText}>
                  النوع: {PROPERTY_CATEGORIES.find(c => c.id === filters.category)?.label}
                </Text>
              </View>
            )}
            {filters.city && (
              <View style={styles.activeFilterButton}>
                <Text style={styles.activeFilterText}>المدينة: {filters.city}</Text>
              </View>
            )}
            {filters.delegation && filters.city && (
              <View style={styles.activeFilterButton}>
                <Text style={styles.activeFilterText}>المعتمدية: {filters.delegation}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} key={reloadKey}>
      <Header showLogo showBackButton={false} onLogoPress={() => setReloadKey(k => k + 1)} />
      
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFilterPress={() => setShowAdvancedSearch(true)}
            />
            {/* Active Filters Row (Main View) */}
            <View style={styles.activeFiltersRow}>
              {filters.category && (
                <View style={styles.activeFilterButton}>
                  <Text style={styles.activeFilterText}>
                    النوع: {PROPERTY_CATEGORIES.find(c => c.id === filters.category)?.label}
                  </Text>
                </View>
              )}
              {filters.city && (
                <View style={styles.activeFilterButton}>
                  <Text style={styles.activeFilterText}>المدينة: {filters.city}</Text>
                </View>
              )}
              {filters.delegation && filters.city && (
                <View style={styles.activeFilterButton}>
                  <Text style={styles.activeFilterText}>المعتمدية: {filters.delegation}</Text>
                </View>
              )}
            </View>
            <Modal
              visible={showAdvancedSearch}
              transparent
              animationType="slide"
              onRequestClose={() => setShowAdvancedSearch(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity 
                      style={styles.resetFiltersButton}
                      onPress={() => {
                        setSelectedCategory(null);
                        setSelectedCity(null);
                        setSelectedDelegation(null);
                        setFilters({ category: undefined, city: undefined, delegation: undefined });
                        setShowAdvancedSearch(false);
                      }}
                    >
                      <Text style={styles.resetFiltersButtonText}>إعادة تعيين الفلاتر</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowAdvancedSearch(false)} style={styles.closeButton}>
                      <X size={24} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  {/* Active Filters Row */}
                  <View style={styles.activeFiltersRow}>
                    {selectedCategory && (
                      <View style={styles.activeFilterButton}>
                        <Text style={styles.activeFilterText}>
                          النوع: {PROPERTY_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                        </Text>
                      </View>
                    )}
                    {selectedCity && (
                      <View style={styles.activeFilterButton}>
                        <Text style={styles.activeFilterText}>المدينة: {selectedCity.label}</Text>
                      </View>
                    )}
                    {selectedDelegation && selectedCity && (
                      <View style={styles.activeFilterButton}>
                        <Text style={styles.activeFilterText}>
                          المعتمدية: {selectedCity.delegations.find(d => d.id === selectedDelegation)?.label}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>نوع العقار</Text>
                    <TouchableOpacity
                      style={styles.locationSelect}
                      onPress={() => setShowCategoryModal(true)}
                    >
                      <Text style={[
                        styles.locationSelectText,
                        !selectedCategory && styles.placeholderText
                      ]}>
                        {selectedCategory
                          ? PROPERTY_CATEGORIES.find(c => c.id === selectedCategory)?.label
                          : 'اختر نوع العقار'}
                      </Text>
                      <ChevronDown size={20} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>المدينة</Text>
                    <TouchableOpacity
                      style={styles.locationSelect}
                      onPress={() => setShowCityModal(true)}
                    >
                      <Text style={[
                        styles.locationSelectText,
                        !selectedCity && styles.placeholderText
                      ]}>
                        {selectedCity ? selectedCity.label : 'اختر المدينة'}
                      </Text>
                      <ChevronDown size={20} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>المعتمدية</Text>
                    <TouchableOpacity
                      style={styles.locationSelect}
                      onPress={() => selectedCity && setShowDelegationModal(true)}
                      disabled={!selectedCity}
                    >
                      <Text style={[
                        styles.locationSelectText,
                        !selectedDelegation && styles.placeholderText
                      ]}>
                        {selectedDelegation
                          ? selectedCity?.delegations.find(d => d.id === selectedDelegation)?.label
                          : 'اختر المعتمدية'}
                      </Text>
                      <ChevronDown size={20} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => {
                      setFilters({
                        category: selectedCategory ? String(selectedCategory) : undefined,
                        city: selectedCity?.label ? String(selectedCity.label) : undefined,
                        delegation: selectedDelegation && selectedCity?.delegations.find(d => d.id === selectedDelegation)?.label ? String(selectedCity.delegations.find(d => d.id === selectedDelegation)?.label) : undefined,
                      });
                      setShowAdvancedSearch(false);
                    }}
                  >
                    <Text style={styles.searchButtonText}>بحث</Text>
                  </TouchableOpacity>
                  <Modal
                    visible={showCategoryModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCategoryModal(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>اختر نوع العقار</Text>
                          <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={styles.closeButton}>
                            <X size={24} color={Theme.colors.text.primary} />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                          {PROPERTY_CATEGORIES.map((category) => (
                            <TouchableOpacity
                              key={category.id}
                              style={styles.modalItem}
                              onPress={() => {
                                setSelectedCategory(category.id);
                                setShowCategoryModal(false);
                              }}
                            >
                              <Text style={styles.modalItemText}>{category.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                  <Modal
                    visible={showCityModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCityModal(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>اختر المدينة</Text>
                          <TouchableOpacity onPress={() => setShowCityModal(false)} style={styles.closeButton}>
                            <X size={24} color={Theme.colors.text.primary} />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                          {LOCATIONS.map((location) => (
                            <TouchableOpacity
                              key={location.id}
                              style={styles.modalItem}
                              onPress={() => {
                                setSelectedCity(location);
                                setSelectedDelegation(null);
                                setShowCityModal(false);
                              }}
                            >
                              <Text style={styles.modalItemText}>{location.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                  <Modal
                    visible={showDelegationModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowDelegationModal(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>اختر المعتمدية</Text>
                          <TouchableOpacity onPress={() => setShowDelegationModal(false)} style={styles.closeButton}>
                            <X size={24} color={Theme.colors.text.primary} />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                          {selectedCity?.delegations.map((delegation) => (
                            <TouchableOpacity
                              key={delegation.id}
                              style={styles.modalItem}
                              onPress={() => {
                                setSelectedDelegation(delegation.id);
                                setShowDelegationModal(false);
                              }}
                            >
                              <Text style={styles.modalItemText}>{delegation.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                </View>
              </View>
            </Modal>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[
            styles.cardWrapper,
            numColumns === 1 && styles.singleColumnWrapper
          ]}>
            <PropertyCard property={item} />
          </View>
        )}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.main,
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    width: '100%',
    backgroundColor: Theme.colors.background.main,
  },
  listContent: {
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xl,
    width: '100%',
  },
  columnWrapper: {
    justifyContent: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  singleColumnWrapper: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  footer: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    fontFamily: 'Tajawal-Medium',
  },
  advancedSearchButton: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  advancedSearchIcon: {
    marginLeft: Theme.spacing.sm,
  },
  advancedSearchButtonText: {
    color: 'white',
    fontSize: Theme.fontSizes.lg,
    fontFamily: 'Tajawal-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Theme.colors.background.main,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 480,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  formGroup: {
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  label: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'right',
  },
  locationSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.background.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  locationSelectText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    textAlign: 'right',
  },
  placeholderText: {
    color: Theme.colors.text.light,
  },
  searchButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  searchButtonText: {
    color: 'white',
    fontSize: Theme.fontSizes.lg,
    fontFamily: 'Tajawal-Bold',
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modalItem: {
    padding: Theme.spacing.md,
  },
  modalItemText: {
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    fontFamily: 'Tajawal-Regular',
  },
  activeFiltersRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    minHeight: 32,
  },
  activeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.card,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    marginRight: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  activeFilterText: {
    color: Theme.colors.primary,
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    marginRight: 4,
  },
  activeFilterRemoveIcon: {
    marginLeft: 2,
  },
  resetFiltersButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 8,
  },
  resetFiltersButtonText: {
    color: 'white',
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    letterSpacing: 1,
  },
});