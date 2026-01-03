/**
 * Accessible Button Component
 * Wrapper around React Spectrum Button with consistent styling
 */

import { Button as SpectrumButton } from '@adobe/react-spectrum';
import type { SpectrumButtonProps } from '@react-types/button';

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
