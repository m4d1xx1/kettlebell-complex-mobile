import { Platform, Switch, SwitchProps } from 'react-native';
import { useThemeColors } from '../theme';

export function AppSwitch(props: SwitchProps) {
  const colors = useThemeColors();
  return <Switch {...props}
    trackColor={{ false: colors.border, true: colors.switchTrack }}
    thumbColor={colors.switchThumb} ios_backgroundColor={colors.border}
    {...(Platform.OS === 'web' ? { activeThumbColor: colors.switchThumb } : {})}
  />;
}
