export interface AIModel {
  id: string;
  name: string;
}

export interface AIProvider {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  apiKey: string;
  baseUrl: string;
  models: AIModel[];
  isCustom?: boolean;
}
