import React from 'react';

export interface NativeTimePickerProps {
  visible: boolean;
  value: Date;
  onChange?: (date?: Date) => void;
}

declare const NativeTimePicker: React.FC<NativeTimePickerProps>;
export default NativeTimePicker;
