import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Home, Heart, Plus, User } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  const handleAuthRequired = () => {
    router.replace('/auth/login');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.text.secondary,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTintColor: Theme.colors.text.primary,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarLabel: 'الرئيسية',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Home size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'المفضلة',
          tabBarLabel: 'المفضلة',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Heart size={24} color={color} />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              handleAuthRequired();
            }
          },
        }}
      />
      <Tabs.Screen
        name="new-listing"
        options={{
          title: 'إضافة عقار',
          tabBarLabel: '',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <View style={styles.addButton}>
                <Plus size={24} color={Theme.colors.text.primary} />
              </View>
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              handleAuthRequired();
            }
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarLabel: 'حسابي',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <User size={24} color={color} />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              handleAuthRequired();
            }
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background.main,
    height: 70,
    elevation: 0,
    shadowOpacity: 0,
    paddingBottom: 8,
  },
  tabBarLabel: {
    fontFamily: 'Tajawal-Medium',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    includeFontPadding: false,
  },
  header: {
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarItem: {
    height: 60,
    paddingVertical: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: '100%',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});