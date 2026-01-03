/**
 * Accessible TextField Component
 * Text input with built-in validation, labels, and help text
 */

import React from 'react';
import { TextField as SpectrumTextField, TextFieldProps as SpectrumTextFieldProps } from '@adobe/react-spectrum';

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
