import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { Theme } from '@/constants/theme';

interface StatusBarProps {
  backgroundColor?: string;
  barStyle?: 'light-content' | 'dark-content';
}

export function StatusBar({ 
  backgroundColor = Theme.colors.background.main,
  barStyle = 'dark-content'
}: StatusBarProps) {
  return (
    <RNStatusBar
      backgroundColor={backgroundColor}
      barStyle={barStyle}
      translucent={false}
    />
  );
} 