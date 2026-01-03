/**
 * Accessible Button Component
 * Wrapper around React Spectrum Button with consistent styling
 */

import React from 'react';
import { Button as SpectrumButton, ButtonProps as SpectrumButtonProps } from '@adobe/react-spectrum';

export type ButtonProps = SpectrumButtonProps;

/**
 * Accessible button component with full keyboard and screen reader support
 * 
 * @example
 * ```tsx
 * <Button variant="cta" onPress={() => console.log('clicked')}>
 *   Click Me
 * </Button>
 * ```
 */
export function Button(props: ButtonProps) {
  return <SpectrumButton {...props} />;
}
