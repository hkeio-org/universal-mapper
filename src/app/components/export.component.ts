import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { SchemaService } from '../services/schema.service';
import { TransformationService } from '../services/transformation.service';

@Component({
  selector: 'app-export',
  imports: [CommonModule],
  template: `
    <div class="export-container">
      @if (canExport()) {
      <div class="export-info">
        <h3>Ready to Export</h3>
        <p>{{ documentCount() }} documents ready for MongoDB</p>

        <div class="export-actions">
          <button class="btn-primary" (click)="exportJson()">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
            </svg>
            Download JSON
          </button>

          <button class="btn-secondary" (click)="copyToClipboard()">
            <svg class="icon" viewBox="0 0 24 24">
              <path
                d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
              />
            </svg>
            Copy to Clipboard
          </button>
        </div>

        @if (copied()) {
        <div class="success-message">✓ Copied to clipboard!</div>
        }
      </div>

      <div class="json-preview">
        <h4>JSON Preview</h4>
        <pre>{{ jsonPreview() }}</pre>
      </div>
      } @else {
      <div class="empty-state">
        <p>Complete the transformation to export data</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .export-container {
        padding: 2rem;
      }

      .export-info {
        margin-bottom: 2rem;
      }

      .export-info h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .export-info p {
        margin: 0 0 1.5rem 0;
        color: #666;
      }

      .export-actions {
        display: flex;
        gap: 1rem;
      }

      .btn-primary,
      .btn-secondary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #4caf50;
        color: white;
      }

      .btn-primary:hover {
        background: #45a049;
      }

      .btn-secondary {
        background: white;
        color: #333;
        border: 1px solid #ccc;
      }

      .btn-secondary:hover {
        background: #f5f5f5;
      }

      .icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }

      .success-message {
        margin-top: 1rem;
        padding: 0.75rem;
        background: #e8f5e9;
        color: #2e7d32;
        border-radius: 4px;
        display: inline-block;
      }

      .json-preview {
        background: #f5f5f5;
        border-radius: 4px;
        padding: 1rem;
      }

      .json-preview h4 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .json-preview pre {
        margin: 0;
        padding: 1rem;
        background: white;
        border-radius: 4px;
        overflow-x: auto;
        max-height: 400px;
        font-size: 0.875rem;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
        color: #999;
        background: #fafafa;
        border-radius: 4px;
      }
    `,
  ],
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
