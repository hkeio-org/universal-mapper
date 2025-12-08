import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SchemaService } from '../services/schema.service';

@Component({
  selector: 'app-schema-upload',
  imports: [CommonModule],
  template: `
    <div class="schema-container">
      <div
        class="drop-zone"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        @if (schemaService.schemaFileName()) {
        <div class="file-info">
          <svg class="icon-success" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <h3>{{ schemaService.schemaFileName() }}</h3>
          <p>Mapping schema loaded</p>
          <button class="btn-secondary" (click)="clear($event)">Clear</button>
        </div>
        } @else {
        <div class="drop-prompt">
          <svg class="icon-schema" viewBox="0 0 24 24">
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
          <h3>Drop JSON schema here</h3>
          <p>or click to browse</p>
        </div>
        }

        <input
          #fileInput
          type="file"
          accept=".json"
          (change)="onFileSelected($event)"
          style="display: none"
        />
      </div>

      @if (schemaService.schema()) {
      <div class="schema-preview">
        <h4>Schema Preview</h4>
        <pre>{{ formatSchema() }}</pre>
      </div>
      } @if (error()) {
      <div class="error-message">
        {{ error() }}
      </div>
      }
    </div>
  `,
  styles: [
    `
      .schema-container {
        padding: 2rem;
      }

      .drop-zone {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 3rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #fafafa;
      }

      .drop-zone:hover,
      .drop-zone.drag-over {
        border-color: #9c27b0;
        background: #f3e5f5;
      }

      .drop-prompt,
      .file-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .icon-schema,
      .icon-success {
        width: 64px;
        height: 64px;
        fill: #666;
      }

      .icon-success {
        fill: #4caf50;
      }

      h3 {
        margin: 0;
        color: #333;
        font-size: 1.5rem;
      }

      p {
        margin: 0;
        color: #666;
      }

      .btn-secondary {
        margin-top: 1rem;
        padding: 0.5rem 1.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-secondary:hover {
        background: #f5f5f5;
      }

      .schema-preview {
        margin-top: 2rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      }

      .schema-preview h4 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .schema-preview pre {
        margin: 0;
        padding: 1rem;
        background: white;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
      }

      .error-message {
        margin-top: 1rem;
        padding: 1rem;
        background: #ffebee;
        color: #c62828;
        border-radius: 4px;
      }
    `,
  ],
})
export class SchemaUploadComponent {
  schemaService = inject(SchemaService);

  isDragOver = false;
  error = signal<string>('');

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.handleFile(files[0]);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await this.handleFile(input.files[0]);
    }
  }

  private async handleFile(file: File): Promise<void> {
    if (!file.name.endsWith('.json')) {
      this.error.set('Please select a JSON file');
      return;
    }

    try {
      this.error.set('');
      await this.schemaService.loadSchema(file);
    } catch (err) {
      this.error.set('Failed to load schema: ' + (err as Error).message);
    }
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.schemaService.clear();
    this.error.set('');
  }

  formatSchema(): string {
    const schema = this.schemaService.schema();
    return schema ? JSON.stringify(schema, null, 2) : '';
  }
}
