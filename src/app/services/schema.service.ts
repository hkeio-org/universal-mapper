import { Injectable, signal } from '@angular/core';
import { FieldMapping, MappingSchema } from '../models/mapping.model';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  schema = signal<MappingSchema>({ mappings: [] });

  loadSchema(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const schema = JSON.parse(text) as MappingSchema;
          this.validateSchema(schema);
          this.schema.set(schema);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  setSchema(schema: MappingSchema): void {
    this.schema.set(schema);
  }

  addMapping(mapping: FieldMapping): void {
    this.schema.update((s) => ({
      mappings: [...s.mappings, mapping],
    }));
  }

  removeMapping(index: number): void {
    this.schema.update((s) => ({
      mappings: s.mappings.filter((_, i) => i !== index),
    }));
  }

  updateMapping(index: number, mapping: FieldMapping): void {
    this.schema.update((s) => ({
      mappings: s.mappings.map((m, i) => (i === index ? mapping : m)),
    }));
  }

  private validateSchema(schema: MappingSchema): void {
    if (!schema.mappings || !Array.isArray(schema.mappings)) {
      throw new Error('Invalid schema: missing mappings array');
    }

    for (const [index, mapping] of schema.mappings.entries()) {
      if (!mapping.from) {
        throw new Error(`Invalid schema: mapping ${index} missing from property`);
      }
      if (!mapping.to) {
        throw new Error(`Invalid schema: mapping ${index} missing to property`);
      }
      if (!mapping.type) {
        throw new Error(`Invalid schema: mapping ${index} missing type property`);
      }
    }
  }

  clear(): void {
    this.schema.set({ mappings: [] });
  }

  exportSchema(): string {
    return JSON.stringify(this.schema(), null, 2);
  }
}
