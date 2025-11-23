// ═══════════════════════════════════════════════════════
// CREATE EVENT SCREEN - СОЗДАНИЕ СОБЫТИЯ С ПИКЕРАМИ
// ═══════════════════════════════════════════════════════
// Форма с Date/Time пикерами (прокрутка цифр!)
// Валидация: минимум +24 часа, максимум +2 недели
// ═══════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getToken } from '../../services/auth';
import { eventsAPI } from '../../services/api';

const CATEGORIES = [
  { id: 'sport', name: 'Спорт', icon: '⚽' },
  { id: 'party', name: 'Бухалово', icon: '🍻' },
  { id: 'cafe', name: 'Кафе', icon: '☕' },
  { id: 'culture', name: 'Культура', icon: '🎭' },
  { id: 'outdoor', name: 'На природе', icon: '🏕️' },
  { id: 'games', name: 'Игры', icon: '🎮' },
];

export default function CreateEventScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [videoUri, setVideoUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Date/Time picker states
  const [eventDate, setEventDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    return tomorrow;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Форматирование для отображения
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Обработка изменения даты
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(eventDate.getHours());
      newDate.setMinutes(eventDate.getMinutes());
      setEventDate(newDate);
    }
  };

  // Обработка изменения времени
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(eventDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEventDate(newDate);
    }
  };

  // Выбор видео
  const handlePickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нужно разрешение для доступа к галерее!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        console.log('✅ Видео выбрано:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Ошибка выбора видео:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать видео');
    }
  };

  // Валидация даты
  const validateEventDate = () => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (eventDate < minDate) {
      Alert.alert('Ошибка', 'Событие должно быть минимум через 24 часа!');
      return false;
    }

    if (eventDate > maxDate) {
      Alert.alert('Ошибка', 'Событие должно быть не позднее чем через 2 недели!');
      return false;
    }

    return true;
  };

  // Публикация события
  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название события!');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Ошибка', 'Введите место!');
      return;
    }
    if (!category) {
      Alert.alert('Ошибка', 'Выберите категорию!');
      return;
    }
    if (!videoUri) {
      Alert.alert('Ошибка', 'Добавьте видео рилс!');
      return;
    }

    if (!validateEventDate()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Ошибка', 'Нужно войти в аккаунт!');
        setIsLoading(false);
        return;
      }

      const dateTimeString = eventDate.toISOString();
      console.log('✅ Дата события:', dateTimeString);

      // ВРЕМЕННО: тестовое видео
      const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

      const response = await eventsAPI.create(token, {
        title: title.trim(),
        description: '',
        location: location.trim(),
        dateTime: dateTimeString,
        category: category,
        maxParticipants: parseInt(maxParticipants) || 10,
        videoUrl: videoUrl,
      });

      console.log('✅ Событие создано:', response);

      Alert.alert('Успех! 🎉', 'Событие опубликовано!', [
        {
          text: 'ОК',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Ошибка создания события:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать событие');
    } finally {
      setIsLoading(false);
    }
  };

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const maxDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Создать событие</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Видео */}
        <TouchableOpacity
          style={styles.videoButton}
          onPress={handlePickVideo}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {videoUri ? (
            <Video
              source={{ uri: videoUri }}
              style={styles.videoPreview}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
            />
          ) : (
            <>
              <Text style={styles.videoIcon}>📹</Text>
              <Text style={styles.videoText}>Добавить видео рилс</Text>
              <Text style={styles.videoSubtext}>(макс 60 сек)</Text>
            </>
          )}
        </TouchableOpacity>

        {videoUri && (
          <TouchableOpacity style={styles.changeVideoButton} onPress={handlePickVideo}>
            <Text style={styles.changeVideoText}>Изменить видео</Text>
          </TouchableOpacity>
        )}

        {/* Название */}
        <View style={styles.field}>
          <Text style={styles.label}>Название события *</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: Йога на крыше"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
          />
        </View>

        {/* Место */}
        <View style={styles.field}>
          <Text style={styles.label}>Место *</Text>
          <TextInput
            style={styles.input}
            placeholder="Адрес или название места"
            placeholderTextColor="#666"
            value={location}
            onChangeText={setLocation}
            editable={!isLoading}
          />
        </View>

        {/* Дата и время с ПИКЕРАМИ */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Дата *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.pickerText}>{formatDate(eventDate)}</Text>
              <Text style={styles.pickerIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Время *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.pickerText}>{formatTime(eventDate)}</Text>
              <Text style={styles.pickerIcon}>🕐</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker - ПРОКРУТКА! */}
        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )}

        {/* Time Picker - ПРОКРУТКА! */}
        {showTimePicker && (
          <DateTimePicker
            value={eventDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        <Text style={styles.hint}>💡 Событие от 24 часов до 2 недель</Text>

        {/* Макс участников */}
        <View style={styles.field}>
          <Text style={styles.label}>Максимум участников</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            placeholderTextColor="#666"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>

        {/* Категория */}
        <View style={styles.field}>
          <Text style={styles.label}>Категория *</Text>
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Кнопка публикации */}
        <TouchableOpacity
          style={[styles.publishButton, isLoading && styles.publishButtonDisabled]}
          onPress={handlePublish}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.publishText}>Опубликовать</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    width: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  videoButton: {
    backgroundColor: '#2d2d44',
    height: 300,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  videoIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  videoText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 4,
  },
  videoSubtext: {
    fontSize: 12,
    color: '#666',
  },
  changeVideoButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  changeVideoText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '600',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  pickerButton: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    color: '#fff',
    fontSize: 16,
  },
  pickerIcon: {
    fontSize: 20,
  },
  hint: {
    fontSize: 12,
    color: '#00D4AA',
    marginBottom: 20,
    marginTop: -10,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: '#2d2d44',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#00D4AA',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  categoryText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  publishButton: {
    backgroundColor: '#00D4AA',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});