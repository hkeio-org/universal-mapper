import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SchemaService } from '../../services/schema.service';

@Component({
  selector: 'app-schema-upload',
  imports: [CommonModule],
  templateUrl: './schema-upload.component.html',
  styleUrls: ['./schema-upload.component.scss'],
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
