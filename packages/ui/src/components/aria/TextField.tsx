/**
 * Accessible TextField Component
 * Text input with built-in validation, labels, and help text
 */

import { TextField as SpectrumTextField } from '@adobe/react-spectrum';
import type { SpectrumTextFieldProps } from '@react-types/textfield';

export type TextFieldProps = SpectrumTextFieldProps;

/**
 * Accessible text input with label, validation, and help text
 * 
 * @example
 * ```tsx
 * <TextField 
 *   label="Email" 
 *   type="email"
 *   isRequired
 *   errorMessage="Please enter a valid email"
 * />
 * ```
 */
export function TextField(props: TextFieldProps) {
  return <SpectrumTextField {...props} />;
}
