import { Component } from '@angular/core';
import { CsvUploadComponent } from './components/csv-upload.component';
import { ExportComponent } from './components/export.component';
import { PreviewComponent } from './components/preview.component';
import { SchemaUploadComponent } from './components/schema-upload.component';

@Component({
  selector: 'app-root',
  imports: [CsvUploadComponent, SchemaUploadComponent, PreviewComponent, ExportComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>Universal Mapper</h1>
        <p>Transform MariaDB CSV exports to MongoDB JSON</p>
      </header>

      <main>
        <div class="grid">
          <div class="card">
            <h2>1. Upload CSV</h2>
            <app-csv-upload />
          </div>

          <div class="card">
            <h2>2. Upload Schema</h2>
            <app-schema-upload />
          </div>
        </div>

        <div class="card">
          <h2>3. Preview</h2>
          <app-preview />
        </div>

        <div class="card">
          <h2>4. Export</h2>
          <app-export />
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background: #f5f5f5;
      }

      header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        text-align: center;
      }

      header h1 {
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
      }

      header p {
        margin: 0;
        opacity: 0.9;
      }

      main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .card h2 {
        margin: 0;
        padding: 1.5rem 2rem;
        background: #fafafa;
        border-bottom: 1px solid #eee;
        font-size: 1.25rem;
        color: #333;
      }
    `,
  ],
})
export class App {}
