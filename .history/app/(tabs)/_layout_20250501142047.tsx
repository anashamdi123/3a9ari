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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'المفضلة',
          tabBarIcon: ({ color, size }) => (
            <Heart size={size} color={color} />
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
          tabBarIcon: ({ color }) => (
            <View style={[styles.addButton, { backgroundColor: Theme.colors.primary }]}>
              <Plus size={24} color="white" />
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
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
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
    height: 60,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontFamily: 'Tajawal-Medium',
    fontSize: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});