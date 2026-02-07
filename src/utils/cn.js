import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditionally merging Tailwind CSS classes.
 * Combines clsx for conditional logic with tailwind-merge to resolve conflicts.
 *
 * @param {...(string | undefined | null | false | Record<string, boolean>)} inputs
 * @returns {string} Merged class string
 *
 * @example
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * cn('px-4 py-2', isActive && 'bg-electric-600', 'rounded-chill')
 * cn('text-white', { 'opacity-50': isDisabled, 'shadow-glow': isGlowing })
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
