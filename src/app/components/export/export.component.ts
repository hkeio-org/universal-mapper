import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { SchemaService } from '../../services/schema.service';
import { TransformationService } from '../../services/transformation.service';

@Component({
  selector: 'app-export',
  imports: [CommonModule],
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
  private transformService = inject(TransformationService);
  private schemaService = inject(SchemaService);

  canExport = computed(() => this.transformService.transformedData().length > 0);
  documentCount = computed(() => this.transformService.transformedData().length);

  private _copied = false;
  private _copyTimeout?: number;

  jsonPreview = computed(() => {
    const data = this.transformService.transformedData().slice(0, 2);
    return JSON.stringify(data, null, 2) + (this.documentCount() > 2 ? '\n\n... and more' : '');
  });

  copied(): boolean {
    return this._copied;
  }

  exportJson(): void {
    const data = this.transformService.transformedData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const schema = this.schemaService.schema();
    const collectionName = schema ? Object.keys(schema.collections)[0] : 'export';

    const link = document.createElement('a');
    link.href = url;
    link.download = `${collectionName}-mongodb.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  async copyToClipboard(): Promise<void> {
    const data = this.transformService.transformedData();
    const json = JSON.stringify(data, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      this._copied = true;

      if (this._copyTimeout) {
        clearTimeout(this._copyTimeout);
      }

      this._copyTimeout = window.setTimeout(() => {
        this._copied = false;
      }, 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }
}
