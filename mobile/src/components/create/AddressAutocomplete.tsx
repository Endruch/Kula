// mobile/src/components/create/AddressAutocomplete.tsx
// ═══════════════════════════════════════════════════════
// ADDRESS AUTOCOMPLETE - АВТОДОПОЛНЕНИЕ АДРЕСОВ
// ═══════════════════════════════════════════════════════
// Использует Nominatim API (OpenStreetMap)
// Бесплатно, без токенов!
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface AddressResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress: (address: string, latitude: number, longitude: number) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectAddress,
  placeholder = 'Адрес или название места',
  editable = true,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce для поиска
  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      searchAddress(value);
    }, 500); // Ждём 500мс после последнего ввода

    return () => clearTimeout(timer);
  }, [value]);

  const searchAddress = async (query: string) => {
    try {
      setLoading(true);
      
      // Nominatim API (бесплатный!) - БЕЗ фильтра по стране
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=5` +
        `&accept-language=en`, // Английский язык результатов
        {
          headers: {
            'User-Agent': 'Kula App', // Обязательно для Nominatim
          },
        }
      );

      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (item: AddressResult) => {
    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);
    
    onSelectAddress(item.display_name, latitude, longitude);
    onChangeText(item.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    console.log(`📍 Адрес выбран: ${item.display_name} (${latitude}, ${longitude})`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#00D4AA"
            style={styles.loader}
          />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.suggestionItem}
                onPress={() => handleSelectAddress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionIcon}>📍</Text>
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    color: '#fff',
    fontSize: 16,
  },
  loader: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d54',
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
});