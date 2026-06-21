/**
 * Pure functions for AIModel operations within a provider's model list.
 * No React dependencies — safe to import from any context.
 */
import { AIProvider, AIModel } from '../../types/ai';
import { buildModel, ModelFormValues } from './validation';

export function addModelToProvider(
  providers: AIProvider[],
  providerId: string,
  values: ModelFormValues,
): AIProvider[] {
  const model = buildModel(values);
  return providers.map(p =>
    p.id === providerId
      ? { ...p, models: [...p.models, model] }
      : p,
  );
}

export function deleteModelFromProvider(
  providers: AIProvider[],
  providerId: string,
  modelId: string,
): AIProvider[] {
  return providers.map(p =>
    p.id === providerId
      ? { ...p, models: p.models.filter(m => m.id !== modelId) }
      : p,
  );
}

export function saveEditedModelInProvider(
  providers: AIProvider[],
  providerId: string,
  editingModelId: string,
  values: ModelFormValues,
): AIProvider[] {
  const normalizedModel = buildModel(values);
  return providers.map(p =>
    p.id === providerId
      ? { ...p, models: p.models.map(m => (m.id === editingModelId ? normalizedModel : m)) }
      : p,
  );
}

export function copyModelInProvider(
  providers: AIProvider[],
  providerId: string,
  model: AIModel,
): AIProvider[] {
  const newModel: AIModel = {
    id: `${model.id}-copy`,
    name: `${model.name} (副本)`,
  };
  return providers.map(p =>
    p.id === providerId
      ? { ...p, models: [...p.models, newModel] }
      : p,
  );
}
