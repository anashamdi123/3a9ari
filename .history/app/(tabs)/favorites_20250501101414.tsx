import React from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/Button';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { favorites, loading, fetchFavorites } = useFavorites();
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
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
  
  return (
    <SafeAreaView style={styles.container}>
    
      
      <FlatList
        data={favorites.map(fav => fav.property).filter(Boolean)}
        keyExtractor={(item) => item!.id}
        renderItem={({ item }) => <PropertyCard property={item!} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchFavorites}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={64} color={Theme.colors.text.light} />
            <Text style={styles.emptyText}>
              لم تقم بإضافة أي عقارات للمفضلة بعد
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  header: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  message: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
});