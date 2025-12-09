import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { SchemaService } from '../services/schema.service';
import { TransformationService } from '../services/transformation.service';

@Component({
  selector: 'app-preview',
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      @if (hasData()) {
      <div class="preview-header">
        <h3>Preview (First 5 Rows)</h3>
        <span class="total-count">Total: {{ totalCount() }} documents</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              @for (field of fields(); track field) {
              <th>{{ field }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (doc of transformService.previewData(); track $index) {
            <tr>
              <td>{{ $index + 1 }}</td>
              @for (field of fields(); track field) {
              <td>{{ formatValue(doc[field]) }}</td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>

      @if (transformService.errors().length > 0) {
      <div class="errors-section">
        <h4>Transformation Warnings</h4>
        <ul>
          @for (error of transformService.errors().slice(0, 10); track $index) {
          <li>{{ error }}</li>
          }
        </ul>
        @if (transformService.errors().length > 10) {
        <p class="more-errors">... and {{ transformService.errors().length - 10 }} more</p>
        }
      </div>
      } } @else {
      <div class="empty-state">
        <p>Upload CSV and JSON schema to see preview</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .preview-container {
        padding: 2rem;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .preview-header h3 {
        margin: 0;
        color: #333;
      }

      .total-count {
        color: #666;
        font-size: 0.875rem;
      }

      .table-wrapper {
        overflow-x: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }

      th,
      td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background: #f5f5f5;
        font-weight: 600;
        color: #333;
        position: sticky;
        top: 0;
      }

      td {
        color: #666;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      tbody tr:hover {
        background: #fafafa;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
        color: #999;
        background: #fafafa;
        border-radius: 4px;
      }

      .errors-section {
        margin-top: 2rem;
        padding: 1rem;
        background: #fff3e0;
        border-left: 4px solid #ff9800;
        border-radius: 4px;
      }

      .errors-section h4 {
        margin: 0 0 0.5rem 0;
        color: #e65100;
      }

      .errors-section ul {
        margin: 0;
        padding-left: 1.5rem;
      }

      .errors-section li {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      .more-errors {
        margin: 0.5rem 0 0 0;
        color: #999;
        font-size: 0.875rem;
        font-style: italic;
      }
    `,
  ],
})
export class PreviewComponent {
  transformService = inject(TransformationService);
  private schemaService = inject(SchemaService);

  hasData = computed(() => this.transformService.previewData().length > 0);
  totalCount = computed(() => this.transformService.transformedData().length);

  fields = computed(() => {
    const schema = this.schemaService.schema();
    return schema.mappings.map((m) => m.to);
  });

  formatValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
