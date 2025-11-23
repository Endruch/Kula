// src/screens/profile/ProfileScreen.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function ProfileScreen({ route }: any) {
  const { logout } = useAuth(); // ← ИСПОЛЬЗУЕМ!
  const { user } = route.params;

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены что хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            // Используем функцию logout из контекста
            await logout();
            // Навигация на Welcome произойдёт автоматически!
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Информация</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏙️ Город:</Text>
          <Text style={styles.infoValue}>{user.city || 'Не указано'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Регистрация:</Text>
          <Text style={styles.infoValue}>
            {new Date(user.createdAt).toLocaleDateString('ru-RU')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID:</Text>
          <Text style={styles.infoValueSmall}>{user.id}</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert('Скоро!', 'Редактирование профиля в разработке')}
        >
          <Text style={styles.editButtonText}>✏️ Редактировать профиль</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Выйти</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Версия MVP 0.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#0f3460',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4ecca3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#aaa',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#16213e',
    margin: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecca3',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  infoLabel: {
    fontSize: 16,
    color: '#aaa',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  infoValueSmall: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    maxWidth: 200,
  },
  actionsSection: {
    padding: 20,
  },
  editButton: {
    backgroundColor: '#4ecca3',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e74c3c',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#555',
    fontSize: 12,
    paddingBottom: 30,
  },
});