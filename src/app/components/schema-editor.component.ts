import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldMapping } from '../models/mapping.model';
import { CsvParserService } from '../services/csv-parser.service';
import { SchemaService } from '../services/schema.service';

@Component({
  selector: 'app-schema-editor',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <div class="editor-header">
        <h3>Field Mappings</h3>
        <div class="header-actions">
          <button class="btn-secondary" (click)="importSchema()">
            <svg class="icon" viewBox="0 0 24 24">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
              />
            </svg>
            Import JSON
          </button>
          <button class="btn-secondary" (click)="exportSchemaFile()">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
            </svg>
            Export Schema
          </button>
        </div>
      </div>

      <div class="mapping-form">
        <div class="form-row">
          <div class="form-group">
            <label>Source Field (CSV)</label>
            <select
              [ngModel]="newMapping().from"
              (ngModelChange)="updateField('from', $event)"
              class="form-control"
            >
              <option value="">Select field...</option>
              @for (header of csvHeaders(); track header) {
              <option [value]="header">{{ header }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label>Target Field (MongoDB)</label>
            <input
              type="text"
              [ngModel]="newMapping().to"
              (ngModelChange)="updateField('to', $event)"
              class="form-control"
              placeholder="e.g. _id, email, profile.name"
            />
          </div>

          <div class="form-group">
            <label>Type</label>
            <select
              [ngModel]="newMapping().type"
              (ngModelChange)="updateField('type', $event)"
              class="form-control"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>

          <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn-primary" (click)="addMapping()" [disabled]="!canAddMapping()">
              Add Mapping
            </button>
          </div>
        </div>
      </div>

      @if (schema().mappings.length > 0) {
      <div class="mappings-list">
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>→</th>
              <th>Target</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (mapping of schema().mappings; track $index) {
            <tr>
              <td>
                <code>{{ mapping.from }}</code>
              </td>
              <td class="arrow">→</td>
              <td>
                <code>{{ mapping.to }}</code>
              </td>
              <td>
                <span class="type-badge">{{ mapping.type }}</span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="removeMapping($index)" title="Remove">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                    />
                  </svg>
                </button>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      } @else {
      <div class="empty-state">
        <p>No field mappings defined. Add your first mapping above.</p>
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
  `,
  styles: [
    `
      .editor-container {
        padding: 2rem;
      }

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .editor-header h3 {
        margin: 0;
        color: #333;
      }

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }

      .mapping-form {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 4px;
        margin-bottom: 2rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr 150px 150px;
        gap: 1rem;
        align-items: end;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        margin-bottom: 0.5rem;
        color: #666;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .form-control {
        padding: 0.625rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.875rem;
        font-family: inherit;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
      }

      select.form-control {
        cursor: pointer;
      }

      .btn-primary,
      .btn-secondary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .btn-primary {
        background: #667eea;
        color: white;
        width: 100%;
      }

      .btn-primary:hover:not(:disabled) {
        background: #5568d3;
      }

      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: white;
        color: #333;
        border: 1px solid #ddd;
      }

      .btn-secondary:hover {
        background: #f5f5f5;
      }

      .icon {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      .mappings-list {
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead {
        background: #f5f5f5;
      }

      th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.875rem;
        font-weight: 600;
        color: #666;
      }

      th:nth-child(2) {
        width: 40px;
        text-align: center;
      }

      th:last-child {
        width: 60px;
      }

      td {
        padding: 0.75rem 1rem;
        border-top: 1px solid #eee;
        font-size: 0.875rem;
      }

      td.arrow {
        text-align: center;
        color: #999;
      }

      td.actions {
        text-align: center;
      }

      code {
        background: #f5f5f5;
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        font-size: 0.875rem;
        font-family: monospace;
      }

      .type-badge {
        display: inline-block;
        padding: 0.25rem 0.625rem;
        background: #e3f2fd;
        color: #1976d2;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .btn-icon {
        padding: 0.25rem;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #999;
        transition: color 0.2s;
      }

      .btn-icon:hover {
        color: #f44336;
      }

      .btn-icon svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
        color: #999;
        background: #fafafa;
        border-radius: 4px;
      }

      .empty-state p {
        margin: 0;
      }

      @media (max-width: 1024px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SchemaEditorComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  schemaService = inject(SchemaService);
  csvParser = inject(CsvParserService);

  schema = this.schemaService.schema;
  csvHeaders = computed(() => this.csvParser.headers());

  newMapping = signal<FieldMapping>({
    from: '',
    to: '',
    type: 'string',
  });

  canAddMapping = computed(() => {
    const m = this.newMapping();
    return m.from && m.to && m.type;
  });

  updateField(field: keyof FieldMapping, value: unknown): void {
    this.newMapping.update((m) => ({ ...m, [field]: value }));
  }

  addMapping(): void {
    if (!this.canAddMapping()) return;

    this.schemaService.addMapping({ ...this.newMapping() });

    this.newMapping.set({
      from: '',
      to: '',
      type: 'string',
    });
  }

  removeMapping(index: number): void {
    this.schemaService.removeMapping(index);
  }

  exportSchemaFile(): void {
    const json = this.schemaService.exportSchema();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'mapping-schema.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  importSchema(): void {
    this.fileInput?.nativeElement?.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.name.endsWith('.json')) {
        alert('Please select a JSON file');
        return;
      }
      
      try {
        await this.schemaService.loadSchema(file);
        input.value = '';
      } catch (err) {
        alert('Failed to load schema: ' + (err as Error).message);
      }
    }
  }
}
