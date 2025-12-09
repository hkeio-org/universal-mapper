import { Component } from '@angular/core';
import { CsvUploadComponent } from './components/csv-upload/csv-upload.component';
import { ExportComponent } from './components/export/export.component';
import { PreviewComponent } from './components/preview/preview.component';
import { SchemaUploadComponent } from './components/schema-upload/schema-upload.component';

@Component({
  selector: 'app-root',
  imports: [CsvUploadComponent, SchemaUploadComponent, PreviewComponent, ExportComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class App {}
