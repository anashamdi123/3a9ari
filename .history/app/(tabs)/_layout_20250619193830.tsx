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
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    textAlign: 'center',
    width: '100%',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: '100%',
    marginBottom: 15,
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