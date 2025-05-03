import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { SceneMap, TabView, TabBar } from 'react-native-tab-view';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostsRoute = () => (
  <View style={styles.scene}><Text style={styles.tabText}>User Posts</Text></View>
);
const FriendsRoute = () => (
  <View style={styles.scene}><Text style={styles.tabText}>Friends List</Text></View>
);
const GalleryRoute = () => (
  <View style={styles.scene}><Text style={styles.tabText}>Photo Gallery</Text></View>
);

const renderScene = SceneMap({
  posts: PostsRoute,
  friends: FriendsRoute,
  gallery: GalleryRoute,
});

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'posts', title: 'Posts' },
    { key: 'friends', title: 'Friends' },
    { key: 'gallery', title: 'Gallery' },
  ]);

  const [email, setEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [joinedSince, setJoinedSince] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      const user_id = await AsyncStorage.getItem('userId');
      const res = await fetch(`${baseUrl}/users/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let created_date = new Date(data.createdDate);
        setJoinedSince(format(created_date, 'PPP'));
        setEmail(data.email);
        // fallback image if none provided
        setAvatarUrl(data.avatarUrl || 'https://placehold.co/64x64'); 
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {loading ? (
            <ActivityIndicator color="#00ff99" />
          ) : (
            <>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.email}>{email}</Text>
                <Text style={styles.joined}>Joined since {joinedSince}</Text>
              </View>
            </>
          )}
        </View>

        {/* Tab View */}
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={props => (
            <TabBar
              {...props}
              style={styles.tabBar}
              indicatorStyle={styles.indicator}
              renderLabel={({ route, focused }) => (
                <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                  {route.title}
                </Text>
              )}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#333',
  },
  userInfo: {
    flexDirection: 'column',
  },
  email: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joined: {
    color: '#aaa',
    fontSize: 14,
  },
  tabBar: {
    backgroundColor: '#121212',
  },
  indicator: {
    backgroundColor: '#00ff99',
  },
  tabLabel: {
    color: '#888',
    fontWeight: 'bold',
  },
  tabLabelActive: {
    color: '#00ff99',
  },
  scene: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  tabText: {
    color: '#fff',
  },
});
