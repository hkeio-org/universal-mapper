import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CsvParserService } from '../services/csv-parser.service';

@Component({
  selector: 'app-csv-upload',
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div
        class="drop-zone"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        @if (csvParser.fileName()) {
        <div class="file-info">
          <svg class="icon-success" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <h3>{{ csvParser.fileName() }}</h3>
          <p>{{ csvParser.parsedData().length }} rows loaded</p>
          <button class="btn-secondary" (click)="clear($event)">Clear</button>
        </div>
        } @else {
        <div class="drop-prompt">
          <svg class="icon-upload" viewBox="0 0 24 24">
            <path
              d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
            />
          </svg>
          <h3>Drop CSV file here</h3>
          <p>or click to browse</p>
        </div>
        }

        <input
          #fileInput
          type="file"
          accept=".csv"
          (change)="onFileSelected($event)"
          style="display: none"
        />
      </div>

      @if (error()) {
      <div class="error-message">
        {{ error() }}
      </div>
      }
    </div>
  `,
  styles: [
    `
      .upload-container {
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
        border-color: #2196f3;
        background: #e3f2fd;
      }

      .drop-prompt,
      .file-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .icon-upload,
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
export class CsvUploadComponent {
  csvParser = inject(CsvParserService);

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
    if (!file.name.endsWith('.csv')) {
      this.error.set('Please select a CSV file');
      return;
    }

    try {
      this.error.set('');
      await this.csvParser.parseFile(file);
    } catch (err) {
      this.error.set('Failed to parse CSV file: ' + (err as Error).message);
    }
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.csvParser.clear();
    this.error.set('');
  }
}
