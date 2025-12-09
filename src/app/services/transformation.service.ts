import { Injectable, computed, inject, signal } from '@angular/core';
import { FieldMapping, TransformedDocument } from '../models/mapping.model';
import { CsvParserService } from './csv-parser.service';
import { SchemaService } from './schema.service';

@Injectable({
  providedIn: 'root',
})
export class TransformationService {
  private csvParser = inject(CsvParserService);
  private schemaService = inject(SchemaService);

  transformedData = computed(() => {
    const schema = this.schemaService.schema();
    const csvData = this.csvParser.parsedData();

    if (!schema.mappings.length || !csvData.length) {
      return [];
    }

    return csvData.map((row) => this.transformRow(row, schema.mappings));
  });

  previewData = computed(() => this.transformedData().slice(0, 5));

  errors = signal<string[]>([]);

  private transformRow(row: Record<string, string>, mappings: FieldMapping[]): TransformedDocument {
    const result: TransformedDocument = {};

    for (const mapping of mappings) {
      const value = row[mapping.from];

      try {
        result[mapping.to] = this.convertValue(value, mapping);
      } catch (error) {
        result[mapping.to] = mapping.default ?? null;
        this.errors.update((errors) => [
          ...errors,
          `Failed to convert ${mapping.from} to ${mapping.to}: ${(error as Error).message}`,
        ]);
      }
    }

    return result;
  }

  private convertValue(value: string, mapping: FieldMapping): unknown {
    if (value === null || value === undefined || value === '') {
      return mapping.default ?? null;
    }

    switch (mapping.type) {
      case 'string':
        return value;

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Cannot convert "${value}" to number`);
        }
        return num;

      case 'boolean':
        const lower = value.toLowerCase().trim();
        if (lower === 'true' || lower === '1' || lower === 'yes') return true;
        if (lower === 'false' || lower === '0' || lower === 'no') return false;
        throw new Error(`Cannot convert "${value}" to boolean`);

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error(`Cannot convert "${value}" to date`);
        }
        return date.toISOString();

      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map((v) => v.trim());
        }

      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          throw new Error(`Cannot parse "${value}" as JSON object`);
        }

      default:
        return value;
    }
  }

  clearErrors(): void {
    this.errors.set([]);
  }
}
