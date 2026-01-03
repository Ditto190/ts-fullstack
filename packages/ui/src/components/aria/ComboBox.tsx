/**
 * Accessible ComboBox Component
 * Autocomplete dropdown with keyboard navigation and filtering
 */

import { ComboBox as SpectrumComboBox, Item } from '@adobe/react-spectrum';
import type { SpectrumComboBoxProps } from '@react-types/combobox';

export type ComboBoxProps<T> = SpectrumComboBoxProps<T>;

/**
 * Accessible combobox with autocomplete and keyboard navigation
 * 
 * @example
 * ```tsx
 * <ComboBox label="Select City">
 *   <Item key="london">London</Item>
 *   <Item key="paris">Paris</Item>
 *   <Item key="tokyo">Tokyo</Item>
 * </ComboBox>
 * ```
 */
export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  return <SpectrumComboBox {...props} />;
}

// Re-export Item for convenience
export { Item };
