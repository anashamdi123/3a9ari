import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  RefreshControl, 
  SafeAreaView, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator
} from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { favorites, loading, fetchFavorites, toggleFavorite } = useFavorites();
  
  const handleLogin = () => {
    router.push('/auth/login');
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Theme.colors.primary} />
      </View>
    );
  };

  const handleFavoriteToggle = (propertyId: string) => {
    // Immediately remove the property from the local favorites list
    toggleFavorite(propertyId);
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <Header title="المفضلة" /> */}
        <View style={styles.centerContainer}>
          <Heart size={64} color={Theme.colors.primary} />
          <Text style={styles.title}>المفضلة</Text>
          <Text style={styles.message}>
            قم بتسجيل الدخول لحفظ العقارات المفضلة لديك ومتابعتها
          </Text>
          <Button
            title="تسجيل الدخول"
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Loading block similar to index.tsx
  if (loading && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="المفضلة" />
        <View style={styles.searchContainer}>
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>المفضلة</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="المفضلة" />
      <FlatList
        data={favorites.map(fav => fav.property).filter(Boolean)}
        keyExtractor={(item) => item!.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PropertyCard 
              property={item!} 
              onFavoriteToggle={handleFavoriteToggle}
            />
          </View>
        )}
        numColumns={1}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchFavorites}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
            progressViewOffset={20}
            progressBackgroundColor={Theme.colors.background.main}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={64} color={Theme.colors.text.light} />
            <Text style={styles.emptyText}>
              لا توجد عقارات مضافة
            </Text>
          </View>
        }
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.main,
  } as ViewStyle,
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  } as ViewStyle,
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  } as TextStyle,
  message: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  } as TextStyle,
  loginButton: {
    width: '100%',
  } as ViewStyle,
  searchContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    width: '100%',
    backgroundColor: Theme.colors.background.main,
  },
  placeholderContainer: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Theme.colors.text.light,
    fontSize: Theme.fontSizes.lg,
    fontFamily: 'Tajawal-Medium',
  },
  listContent: {
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xl,
    width: '100%',
  } as ViewStyle,
  cardWrapper: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  } as ViewStyle,
  footer: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  } as ViewStyle,
  emptyText: {
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    fontFamily: 'Tajawal-Medium',
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  } as TextStyle,
});