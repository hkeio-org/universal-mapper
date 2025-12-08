import { Injectable, signal } from '@angular/core';
import { MappingSchema } from '../models/mapping.model';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  schema = signal<MappingSchema | null>(null);
  schemaFileName = signal<string>('');

  loadSchema(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const schema = JSON.parse(text) as MappingSchema;
          this.validateSchema(schema);
          this.schema.set(schema);
          this.schemaFileName.set(file.name);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  private validateSchema(schema: MappingSchema): void {
    if (!schema.collections || typeof schema.collections !== 'object') {
      throw new Error('Invalid schema: missing collections object');
    }

    for (const [collectionName, collection] of Object.entries(schema.collections)) {
      if (!collection.source) {
        throw new Error(`Invalid schema: collection "${collectionName}" missing source`);
      }
      if (!collection.mappings || typeof collection.mappings !== 'object') {
        throw new Error(`Invalid schema: collection "${collectionName}" missing mappings`);
      }

      for (const [fieldName, mapping] of Object.entries(collection.mappings)) {
        if (!mapping.from) {
          throw new Error(`Invalid schema: field "${fieldName}" missing from property`);
        }
        if (!mapping.type) {
          throw new Error(`Invalid schema: field "${fieldName}" missing type property`);
        }
      }
    }
  }

  clear(): void {
    this.schema.set(null);
    this.schemaFileName.set('');
  }
}
