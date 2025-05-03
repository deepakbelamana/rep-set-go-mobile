// app/(main)/_layout.tsx
import { Stack } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import Sidebar from '@/components/SideBar'

export default function UserLayout () {
  return (
    <View style={styles.wrapper}>
      <Sidebar />
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' }
          }}
        >
          <Stack.Screen
            name='profile'
            options={{
              title: 'profile', // Custom title for the header
              headerShown: true // Make sure the header is shown
            }}
          />
        </Stack>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row'
  },
  content: {
    flex: 1,
    backgroundColor: '#121212'
  }
})
