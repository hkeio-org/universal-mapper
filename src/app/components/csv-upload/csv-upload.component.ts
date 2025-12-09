import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CsvParserService } from '../../services/csv-parser.service';

@Component({
  selector: 'app-csv-upload',
  imports: [CommonModule],
  templateUrl: './csv-upload.component.html',
  styleUrls: ['./csv-upload.component.scss'],
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
