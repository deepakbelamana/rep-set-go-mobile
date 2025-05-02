// app/(main)/_layout.tsx
import { Stack } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import Sidebar from '@/components/SideBar'

export default function MainLayout () {
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
            name='index'
            options={{
              title: 'Home', // Custom title for the header
              headerShown: true // Make sure the header is shown
            }}
          />
           <Stack.Screen
            name='workout/[groupId]'
            options={{
              title: 'workouts', // Custom title for the header
              headerShown: true // Make sure the header is shown
            }}
            />
             <Stack.Screen
            name='workout_set/[workoutId]'
            options={{
              title: 'workout records', // Custom title for the header
              headerShown: true // Make sure the header is shown
            }}
            />
             <Stack.Screen
            name='progress/[workout_id]'
            options={{
              title: 'your progress', // Custom title for the header
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
