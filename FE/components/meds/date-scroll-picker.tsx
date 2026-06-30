import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { ChoiceChip } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';

const { colors, fonts, radius, spacing } = MedsTheme;

const ITEM_HEIGHT = 44;
const WHEEL_PADDING = ITEM_HEIGHT * 2;
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
] as const;

export function todayInputValue() {
  const date = new Date();
  return toDateInputValue(date);
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function clampDateParts(year: number, month: number, day: number) {
  const maxDay = daysInMonth(year, month);
  return { year, month, day: Math.min(day, maxDay) };
}

function formatDateLabel(value: string) {
  return parseDateInputValue(value).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type WheelColumnProps = {
  items: Array<{ value: number; label: string }>;
  selectedValue: number;
  onValueChange: (value: number) => void;
};

function WheelColumn({ items, selectedValue, onValueChange }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  const selectedIndex = Math.max(0, items.findIndex((item) => item.value === selectedValue));

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex, items.length]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const next = items[Math.min(Math.max(index, 0), items.length - 1)];
    if (next && next.value !== selectedValue) {
      onValueChange(next.value);
    }
  };

  return (
    <View style={styles.columnWrap}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={styles.wheelContent}>
        {items.map((item) => {
          const active = item.value === selectedValue;
          return (
            <Pressable
              key={item.value}
              style={styles.wheelItem}
              onPress={() => onValueChange(item.value)}>
              <Text style={[styles.wheelItemText, active && styles.wheelItemTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.selectionBand} pointerEvents="none" />
    </View>
  );
}

type DateScrollPickerProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
};

export function DateScrollPicker({
  label,
  hint,
  value,
  onChange,
  minDate,
  maxDate,
}: DateScrollPickerProps) {
  const min = useMemo(() => startOfDay(minDate ? parseDateInputValue(minDate) : new Date()), [minDate]);
  const max = useMemo(
    () => (maxDate ? startOfDay(parseDateInputValue(maxDate)) : new Date(min.getFullYear() + 5, 11, 31)),
    [maxDate, min],
  );

  const current = useMemo(() => {
    const parsed = parseDateInputValue(value || todayInputValue());
    const clamped = clampDateParts(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
    const candidate = startOfDay(new Date(clamped.year, clamped.month - 1, clamped.day));
    if (candidate < min) return min;
    if (candidate > max) return max;
    return candidate;
  }, [value, min, max]);

  const year = current.getFullYear();
  const month = current.getMonth() + 1;
  const day = current.getDate();

  const yearOptions = useMemo(() => {
    const items: Array<{ value: number; label: string }> = [];
    for (let y = min.getFullYear(); y <= max.getFullYear(); y += 1) {
      items.push({ value: y, label: String(y) });
    }
    return items;
  }, [min, max]);

  const monthOptions = useMemo(() => {
    const startMonth = year === min.getFullYear() ? min.getMonth() + 1 : 1;
    const endMonth = year === max.getFullYear() ? max.getMonth() + 1 : 12;
    const items: Array<{ value: number; label: string }> = [];
    for (let m = startMonth; m <= endMonth; m += 1) {
      items.push({ value: m, label: MONTH_LABELS[m - 1] });
    }
    return items;
  }, [year, min, max]);

  const dayOptions = useMemo(() => {
    const maxDay = daysInMonth(year, month);
    let startDay = 1;
    let endDay = maxDay;
    if (year === min.getFullYear() && month === min.getMonth() + 1) {
      startDay = min.getDate();
    }
    if (year === max.getFullYear() && month === max.getMonth() + 1) {
      endDay = Math.min(endDay, max.getDate());
    }
    const items: Array<{ value: number; label: string }> = [];
    for (let d = startDay; d <= endDay; d += 1) {
      items.push({ value: d, label: String(d) });
    }
    return items;
  }, [year, month, min, max]);

  const emitChange = useCallback(
    (nextYear: number, nextMonth: number, nextDay: number) => {
      const clamped = clampDateParts(nextYear, nextMonth, nextDay);
      const nextDate = startOfDay(new Date(clamped.year, clamped.month - 1, clamped.day));
      if (nextDate < min) {
        onChange(toDateInputValue(min));
        return;
      }
      if (nextDate > max) {
        onChange(toDateInputValue(max));
        return;
      }
      onChange(toDateInputValue(nextDate));
    },
    [min, max, onChange],
  );

  const safeMonth = monthOptions.some((item) => item.value === month)
    ? month
    : monthOptions[0]?.value ?? month;
  const safeDay = dayOptions.some((item) => item.value === day) ? day : dayOptions[0]?.value ?? day;

  useEffect(() => {
    const normalized = toDateInputValue(current);
    if (normalized !== value) {
      onChange(normalized);
    }
  }, [current, onChange, value]);

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <Text style={styles.preview}>{formatDateLabel(toDateInputValue(current))}</Text>
      <View style={styles.wheelRow}>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>Ngày</Text>
          <WheelColumn
            items={dayOptions}
            selectedValue={safeDay}
            onValueChange={(nextDay) => emitChange(year, safeMonth, nextDay)}
          />
        </View>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>Tháng</Text>
          <WheelColumn
            items={monthOptions}
            selectedValue={safeMonth}
            onValueChange={(nextMonth) => emitChange(year, nextMonth, safeDay)}
          />
        </View>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>Năm</Text>
          <WheelColumn
            items={yearOptions}
            selectedValue={year}
            onValueChange={(nextYear) => emitChange(nextYear, safeMonth, safeDay)}
          />
        </View>
      </View>
    </View>
  );
}

function addDaysInputValue(value: string, days: number) {
  const date = parseDateInputValue(value);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

type EndDateScrollPickerProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  minDate: string;
};

export function EndDateScrollPicker({ label, hint, value, onChange, minDate }: EndDateScrollPickerProps) {
  const hasEndDate = Boolean(value.trim());
  const endMinDate = addDaysInputValue(minDate, 1);

  const pickDefaultEndDate = () => {
    onChange(endMinDate);
  };

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.endModeRow}>
        <ChoiceChip
          label="Chưa rõ ngày kết thúc"
          active={!hasEndDate}
          onPress={() => onChange('')}
        />
        <ChoiceChip
          label="Chọn ngày kết thúc"
          active={hasEndDate}
          onPress={() => {
            if (!value.trim()) {
              pickDefaultEndDate();
            }
          }}
        />
      </View>
      {hasEndDate ? (
        <DateScrollPicker
          label=""
          value={value}
          onChange={onChange}
          minDate={endMinDate}
        />
      ) : (
        <Text style={styles.noEndText}>Lịch uống thuốc sẽ không giới hạn ngày kết thúc.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.textMain,
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
  preview: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.textLink,
  },
  wheelRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    borderRadius: radius.lg,
    backgroundColor: colors.canvasSoft,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    overflow: 'hidden',
  },
  columnHeader: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    color: colors.muted,
    marginBottom: spacing.xxs,
  },
  columnWrap: {
    height: ITEM_HEIGHT * 5,
    width: '100%',
    position: 'relative',
  },
  wheelContent: {
    paddingVertical: WHEEL_PADDING,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxs,
  },
  wheelItemText: {
    fontSize: 16,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
  wheelItemTextActive: {
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    fontSize: 18,
  },
  selectionBand: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: WHEEL_PADDING,
    height: ITEM_HEIGHT,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  endModeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  noEndText: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.body,
    fontStyle: 'italic',
  },
});
