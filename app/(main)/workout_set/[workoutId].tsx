import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';


export default function SetScreen() {
  const { workoutId } = useLocalSearchParams();
  const router = useRouter();

  const [sets, setSets] = useState<any[]>([]);
  const [repCount, setRepCount] = useState('');
  const [weight, setWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchSets = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await fetch(`${baseUrl}/set/${workoutId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setSets(data);
        const dates = Array.from(
          new Set(
            data.map((s: any) => s.created_date.split('T')[0])
          )
        ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        setAvailableDates(dates);
        setSelectedDate(dates[0]);
      } catch (err) {
        console.error('Failed to fetch sets', err);
        Toast.show({ type: 'error', text1: 'Error loading sets' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSets();
  }, [workoutId]);

  const handleSave = async () => {
    if (!repCount.trim() || !weight.trim()) return;
    setIsSaving(true);
    const token = await AsyncStorage.getItem('token');
    const payload = {
      workout_id: parseInt(workoutId as string),
      rep_count: parseInt(repCount),
      weight: parseFloat(weight)
    };

    try {
      const res = await fetch(`${baseUrl}/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      setSets(prev => [saved, ...prev]);
      const savedDate = saved.created_date.split('T')[0];

      if (!availableDates.includes(savedDate)) {
        setAvailableDates([savedDate, ...availableDates]);
      }
      setSelectedDate(savedDate);
      setRepCount('');
      setWeight('');
      Toast.show({ type: 'success', text1: 'Set saved!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to save set' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSets = sets.filter(
    s => s.created_date.split('T')[0] === selectedDate
  );

  return (
    <View style={styles.container}>
      <Toast />
      <Text style={styles.header}>Workout Sets</Text>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Reps"
          placeholderTextColor="#888"
          value={repCount}
          onChangeText={setRepCount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Weight"
          placeholderTextColor="#888"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setRepCount('');
            setWeight('');
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Last Performed Set</Text>
      <Picker
        selectedValue={selectedDate}
        onValueChange={setSelectedDate}
        style={styles.picker}
        dropdownIconColor="#fff"
      >
        {availableDates.map(date => (
          <Picker.Item key={date} label={date} value={date} />
        ))}
      </Picker>

      {isLoading ? (
        <ActivityIndicator color="#00ff99" size="large" />
      ) : (
        <FlatList
          data={filteredSets}
          keyExtractor={(item, index) => item.set_id?.toString() || index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.setRow}>
              <Text style={styles.setText}>#{index + 1}</Text>
              <Text style={styles.setText}>Reps: {item.rep_count}</Text>
              <Text style={styles.setText}>Weight: {item.weight}</Text>
            </View>
          )}
        />
      )}

      {sets.length > 0 && (
        <TouchableOpacity
          style={styles.progressButton}
          onPress={() => router.push(`/progress/${workoutId}`)}
        >
          <Text>Check Progress</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  header: { fontSize: 22, color: '#00ff99', marginBottom: 16 },
  subHeader: { fontSize: 18, color: '#fff', marginBottom: 6 },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    flex: 1,
    marginRight: 10,
    borderColor: '#444',
    borderWidth: 1,
  },
  formRow: { flexDirection: 'row', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  saveButton: {
    backgroundColor: '#00aa66',
    flex: 1,
    marginRight: 8,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#aa4444',
    flex: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16 },
  picker: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    marginBottom: 20,
  },
  setRow: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  setText: {
    color: '#fff',
    fontSize: 14,
  },
  progressButton: {
    marginBottom: 20,
    backgroundColor: '#00aa66',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
});
