export interface FieldMapping {
  from: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  default?: unknown;
  transform?: string;
}

export interface CollectionMapping {
  source: string;
  mappings: Record<string, FieldMapping>;
}

export interface MappingSchema {
  collections: Record<string, CollectionMapping>;
}

export interface CsvRow {
  [key: string]: string;
}

export interface TransformedDocument {
  [key: string]: unknown;
}
