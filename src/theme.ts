import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export const palettes = {
  light: {
    bg: '#FFFFFF', panel: '#F5F5F5', card: '#EFEFEF', elevated: '#E2E2E2',
    border: '#CECECE', text: '#111111', muted: '#595959',
    accent: '#111111', accentSoft: '#E8E8E8', accentText: '#FFFFFF',
    bodyweight: '#111111', bodyweightSoft: '#F0F0F0', bodyweightText: '#FFFFFF',
    danger: '#111111', warning: '#111111', muscle: '#FFFFFF',
    figureShade: '#626262', bellShade: '#666666', highlight: '#FFFFFF',
    switchTrack: '#666666', switchThumb: '#FFFFFF',
  },
  dark: {
    bg: '#090909', panel: '#111111', card: '#191919', elevated: '#292929',
    border: '#3D3D3D', text: '#F5F5F5', muted: '#AAAAAA',
    accent: '#F5F5F5', accentSoft: '#292929', accentText: '#111111',
    bodyweight: '#F5F5F5', bodyweightSoft: '#191919', bodyweightText: '#111111',
    danger: '#F5F5F5', warning: '#F5F5F5', muscle: '#191919',
    figureShade: '#999999', bellShade: '#777777', highlight: '#FFFFFF',
    switchTrack: '#AAAAAA', switchThumb: '#111111',
  },
};
export type ThemeColors = typeof palettes.light;

/** Changing system appearance updates colours without remounting the workout. */
export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}

export function useThemeStyles<T>(factory: (colors: ThemeColors) => T) {
  const colors = useThemeColors();
  const styles = useMemo(() => factory(colors), [colors, factory]);
  return { colors, styles };
}

export const radius = { sm: 10, md: 14, lg: 20, xl: 28 };
