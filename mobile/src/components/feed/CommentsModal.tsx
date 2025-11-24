// ═══════════════════════════════════════════════════════
// COMMENTS MODAL - МОДАЛЬНОЕ ОКНО КОММЕНТАРИЕВ
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { commentsAPI } from '../../services/api';
import { getToken, getUser } from '../../services/auth';

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    username: string;
  };
  userId: string;
}

interface CommentsModalProps {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onCommentCountChange: (count: number) => void;
}

export default function CommentsModal({
  visible,
  eventId,
  onClose,
  onCommentCountChange,
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Загружаем текущего пользователя
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Загружаем комментарии когда открывается модалка
  useEffect(() => {
    if (visible) {
      loadComments();
    }
  }, [visible, eventId]);

  const loadCurrentUser = async () => {
    try {
      const userData = await getUser();
      if (userData) {
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentsAPI.getAll(eventId);
      setComments(data);
      onCommentCountChange(data.length);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить комментарии');
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      setSending(true);
      const token = await getToken();
      if (!token) {
        Alert.alert('Ошибка', 'Нужно войти в аккаунт');
        return;
      }

      await commentsAPI.add(token, eventId, newComment.trim());
      setNewComment('');
      await loadComments(); // Перезагружаем список
      console.log('💬 Комментарий отправлен');
    } catch (error) {
      console.error('Ошибка отправки комментария:', error);
      Alert.alert('Ошибка', 'Не удалось отправить комментарий');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Удалить комментарий?',
      'Это действие нельзя отменить',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;

              await commentsAPI.delete(token, commentId);
              await loadComments();
              console.log('🗑️ Комментарий удалён');
            } catch (error) {
              console.error('Ошибка удаления комментария:', error);
              Alert.alert('Ошибка', 'Не удалось удалить комментарий');
            }
          },
        },
      ]
    );
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwn = item.userId === currentUserId;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>@{item.user.username}</Text>
          <Text style={styles.commentTime}>
            {new Date(item.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        {isOwn && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteComment(item.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Удалить</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.modalContent}>
          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Комментарии {comments.length > 0 && `(${comments.length})`}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Список комментариев */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00D4AA" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>Пока нет комментариев</Text>
              <Text style={styles.emptySubtext}>Будьте первым!</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              style={styles.commentsList}
              contentContainerStyle={styles.commentsListContent}
            />
          )}

          {/* Поле ввода */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Написать комментарий..."
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newComment.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendComment}
              disabled={!newComment.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    padding: 20,
  },
  commentItem: {
    backgroundColor: '#252544',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00D4AA',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ff4444',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1a1a2e',
  },
  input: {
    flex: 1,
    backgroundColor: '#252544',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00D4AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#444',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
  },
});