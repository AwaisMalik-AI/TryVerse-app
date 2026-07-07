import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [selectedSize, setSelectedSize] = useState('M');

  // Demo product
  const product = {
    id: id as string,
    name: 'Classic Navy Blazer',
    price: '$129.99',
    brand: 'Everlane',
    description: 'A versatile layer that pulls any outfit together. Made from premium materials for a comfortable, structured fit.',
    image: require('../../../assets/images/poses/business-portrait.jpg'),
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  };

  return (
    <Screen safeArea={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.image} />
          
          <View style={[styles.headerActions, { top: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Saved', 'Item saved to your list.')}>
              <Ionicons name="bookmark-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <View>
              <TypographyText variant="small" color={Colors.textMuted} style={styles.brand}>{product.brand}</TypographyText>
              <TypographyText variant="h2">{product.name}</TypographyText>
            </View>
            <TypographyText variant="h2" color={Colors.primary}>{product.price}</TypographyText>
          </View>

          <TypographyText variant="body" color={Colors.textMuted} style={styles.description}>
            {product.description}
          </TypographyText>

          <View style={styles.section}>
            <TypographyText variant="bodySemibold" style={styles.sectionTitle}>Select Size</TypographyText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeList}>
              {product.sizes.map(size => (
                <TouchableOpacity 
                  key={size}
                  style={[styles.sizeOption, selectedSize === size && styles.sizeOptionActive]}
                  onPress={() => setSelectedSize(size)}
                >
                  <TypographyText 
                    variant="bodySemibold" 
                    color={selectedSize === size ? Colors.text : Colors.textMuted}
                  >
                    {size}
                  </TypographyText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button 
          title="Try On" 
          onPress={() => router.push('/(tabs)/try-on')} 
          style={styles.tryOnBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(21, 21, 34, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  brand: {
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    marginBottom: 32,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sizeList: {
    gap: 12,
  },
  sizeOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  sizeOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(160, 32, 240, 0.2)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tryOnBtn: {
    width: '100%',
  }
});
