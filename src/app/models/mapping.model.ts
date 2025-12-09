export interface FieldMapping {
  from: string;
  to: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  default?: unknown;
}

export interface MappingSchema {
  mappings: FieldMapping[];
}

export interface CsvRow {
  [key: string]: string;
}

export interface TransformedDocument {
  [key: string]: unknown;
}
