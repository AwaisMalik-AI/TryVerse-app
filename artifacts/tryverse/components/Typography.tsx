import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '../constants/theme';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'bodySemibold' | 'small';
  color?: string;
}

export const TypographyText = ({ variant = 'body', color = Colors.text, style, ...props }: CustomTextProps) => {
  let textStyle = {};

  switch (variant) {
    case 'h1':
      textStyle = { fontFamily: Typography.heading.fontFamily, fontSize: 32, lineHeight: 40 };
      break;
    case 'h2':
      textStyle = { fontFamily: Typography.heading.fontFamily, fontSize: 24, lineHeight: 32 };
      break;
    case 'h3':
      textStyle = { fontFamily: Typography.subheading.fontFamily, fontSize: 20, lineHeight: 28 };
      break;
    case 'body':
      textStyle = { fontFamily: Typography.body.fontFamily, fontSize: 16, lineHeight: 24 };
      break;
    case 'bodyMedium':
      textStyle = { fontFamily: Typography.bodyMedium.fontFamily, fontSize: 16, lineHeight: 24 };
      break;
    case 'bodySemibold':
      textStyle = { fontFamily: Typography.bodySemibold.fontFamily, fontSize: 16, lineHeight: 24 };
      break;
    case 'small':
      textStyle = { fontFamily: Typography.body.fontFamily, fontSize: 14, lineHeight: 20 };
      break;
  }

  return <Text style={[textStyle, { color }, style]} {...props} />;
};
