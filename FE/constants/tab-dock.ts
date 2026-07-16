import { Platform } from 'react-native';

/** Floating tab dock dimensions — keep in sync with app/(tabs)/_layout.tsx */
export const TAB_DOCK_LAYOUT = {
  height: Platform.OS === 'ios' ? 68 : 64,
  bottomOffset: Platform.OS === 'ios' ? 26 : 18,
  contentGap: 20,
} as const;

/** Bottom padding for ScrollView content so last items clear the floating tab bar. */
export function tabDockScrollPadding(extra = 0) {
  return TAB_DOCK_LAYOUT.height + TAB_DOCK_LAYOUT.bottomOffset + TAB_DOCK_LAYOUT.contentGap + extra;
}
