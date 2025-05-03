import React from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, SafeAreaView, ViewStyle, TextStyle } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/Button';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from '@/components/StatusBar';

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
        <StatusBar />
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
      <StatusBar />
      <FlatList
        data={favorites.map(fav => fav.property).filter(Boolean)}
        keyExtractor={(item) => item!.id}
        renderItem={({ item }) => <PropertyCard property={item!} />}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
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
  listContent: {
    padding: Theme.spacing.md,
  } as ViewStyle,
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  } as ViewStyle,
  emptyText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.light,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  } as TextStyle,
});