import { Injectable, signal } from '@angular/core';
import { CsvRow } from '../models/mapping.model';

@Injectable({
  providedIn: 'root',
})
export class CsvParserService {
  parsedData = signal<CsvRow[]>([]);
  headers = signal<string[]>([]);
  fileName = signal<string>('');

  parseFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = this.parseCsv(text);

          if (rows.length > 0) {
            this.headers.set(Object.keys(rows[0]));
            this.parsedData.set(rows);
            this.fileName.set(file.name);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  private parseCsv(text: string): CsvRow[] {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = this.parseRow(lines[0]);
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseRow(lines[i]);
      const row: CsvRow = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  }

  private parseRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  clear(): void {
    this.parsedData.set([]);
    this.headers.set([]);
    this.fileName.set('');
  }
}
