import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

export default function ProgressScreen() {
  const { workout_id } = useLocalSearchParams();
  const [volumeData, setVolumeData] = useState<{ [key: string]: number }>({});
  const [oneRm, setOneRm] = useState<number>(0.0);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const [volumeRes, oneRmRes] = await Promise.all([
          fetch(`${baseUrl}/set/progress/${workout_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/set/progress/oneRm/${workout_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (volumeRes.ok) {
          const data = await volumeRes.json();
          setVolumeData(data);
        }

        if (oneRmRes.ok) {
          const rm = await oneRmRes.json();
          setOneRm(rm);
        }
      } catch (error) {
        console.error('Progress fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workout_id]);

  const chartData = Object.entries(volumeData)
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dates = chartData.map(d => d.date);
  const volumes = chartData.map(d => d.volume);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>
        Your one-rep max for this workout is {oneRm.toFixed(2)} kg
      </Text>

      {loading ? (
        <ActivityIndicator color="#00ff99" size="large" style={{ marginTop: 30 }} />
      ) : chartData.length === 0 ? (
        <Text style={styles.text}>No progress data found.</Text>
      ) : (
        <LineChart
          data={{
            labels: dates,
            datasets: [
              {
                data: volumes,
                color: () => '#00ff99',
              },
            ],
          }}
          width={Dimensions.get('window').width - 30}
          height={300}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundColor: '#121212',
            backgroundGradientFrom: '#1e1e1e',
            backgroundGradientTo: '#1e1e1e',
            decimalPlaces: 1,
            color: () => '#00ff99',
            labelColor: () => '#ccc',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#00ff99',
            },
          }}
          bezier // makes the curve chart
          style={{
            borderRadius: 12,
            marginVertical: 20,
          }}
        />
      )}

      {/* <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📌 Leaderboards coming soon…</Text>
      </View> */}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    color: '#00ff99',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  placeholder: {
    marginTop: 30,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
});
