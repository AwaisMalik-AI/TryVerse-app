import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { TextInput } from '@/components/TextInput';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';

const CATEGORIES = ['Dresses', 'Blazers', 'Shirts', 'Hoodies', 'Pants', 'Jackets'];

const PRODUCTS = [
  { id: '1', name: 'Classic Navy Blazer', price: '$129.99', brand: 'Everlane', image: require('../../assets/images/poses/business-portrait.jpg') },
  { id: '2', name: 'Silk Midi Dress', price: '$89.50', brand: 'Reformation', image: require('../../assets/images/poses/model-turn.jpg') },
  { id: '3', name: 'Oversized Hoodie', price: '$65.00', brand: 'Nike', image: require('../../assets/images/poses/casual-lean.jpg') },
  { id: '4', name: 'Linen Button-Up', price: '$75.00', brand: 'J.Crew', image: require('../../assets/images/poses/sunlight-portrait.jpg') },
];

export default function StoreScreen() {
  const router = useRouter();

  return (
    <Screen safeArea withBottomNav>
      <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TypographyText variant="h1" style={styles.title}>AI Fashion Store</TypographyText>
        </View>

        <View style={styles.searchSection}>
          <TextInput
            placeholder="Search clothing..."
            leftIcon={<Ionicons name="search-outline" size={20} color={Colors.textMuted} />}
            style={styles.searchInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {CATEGORIES.map((cat, idx) => (
              <TouchableOpacity key={cat} style={[styles.categoryBadge, idx === 0 && styles.categoryBadgeActive]}>
                <TypographyText variant="small" color={idx === 0 ? Colors.text : Colors.textMuted}>{cat}</TypographyText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {PRODUCTS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.productCard}
              onPress={() => router.push(`/store/product/${item.id}`)}
              activeOpacity={0.9}
            >
              <GlassCard style={styles.cardInner}>
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <TypographyText variant="bodySemibold" numberOfLines={1}>{item.name}</TypographyText>
                  <TypographyText variant="small" color={Colors.textMuted}>{item.brand}</TypographyText>
                  <View style={styles.priceRow}>
                    <TypographyText variant="bodySemibold" color={Colors.tertiary}>{item.price}</TypographyText>
                    <TouchableOpacity style={styles.tryButton}>
                      <TypographyText variant="small" color={Colors.primary} style={styles.tryButtonText}>Try On</TypographyText>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  searchSection: {
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  searchInput: {
    height: 48,
  },
  categories: {
    gap: 12,
    paddingVertical: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(160, 32, 240, 0.2)',
    borderColor: Colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  productCard: {
    width: '47%',
  },
  cardInner: {
    padding: 0,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    aspectRatio: 3/4,
  },
  productInfo: {
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(160, 32, 240, 0.1)',
    borderRadius: 8,
  },
  tryButtonText: {
    fontFamily: Typography.bodySemibold.fontFamily,
  }
});
