/**
 * Pure functions for AIProvider array operations.
 * No React dependencies — safe to import from any context.
 */
import { AIProvider } from '../../types/ai';

export function updateProviderInList(
  providers: AIProvider[],
  id: string,
  patch: Partial<AIProvider>,
): AIProvider[] {
  return providers.map(p => (p.id === id ? { ...p, ...patch } : p));
}

export function toggleProviderInList(
  providers: AIProvider[],
  id: string,
  checked: boolean,
): AIProvider[] {
  return providers.map(p => (p.id === id ? { ...p, isEnabled: checked } : p));
}
