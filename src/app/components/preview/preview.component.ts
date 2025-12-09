import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { SchemaService } from '../../services/schema.service';
import { TransformationService } from '../../services/transformation.service';

@Component({
  selector: 'app-preview',
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent {
  transformService = inject(TransformationService);
  private schemaService = inject(SchemaService);

  hasData = computed(() => this.transformService.previewData().length > 0);
  totalCount = computed(() => this.transformService.transformedData().length);

  fields = computed(() => {
    const schema = this.schemaService.schema();
    if (!schema) return [];

    const collectionName = Object.keys(schema.collections)[0];
    return Object.keys(schema.collections[collectionName].mappings);
  });

  formatValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
