# Universal Mapper

Web app for transforming MariaDB CSV exports to MongoDB JSON documents.

## Features

- 📤 **CSV Upload**: Drag-and-drop CSV file upload
- 🗺️ **JSON Schema Mapping**: Define field mappings and type conversions
- 👁️ **Preview**: See first 5 transformed documents
- 💾 **Export**: Download MongoDB-ready JSON

## Usage

1. **Export CSV from MariaDB**

   ```sql
   SELECT * FROM your_table INTO OUTFILE '/tmp/export.csv'
   FIELDS TERMINATED BY ','
   ENCLOSED BY '"'
   LINES TERMINATED BY '\n';
   ```

2. **Create mapping schema** (see `example-schema.json`)

   ```json
   {
     "collections": {
       "users": {
         "source": "users.csv",
         "mappings": {
           "_id": { "from": "id", "type": "number" },
           "email": { "from": "email", "type": "string" }
         }
       }
     }
   }
   ```

3. **Upload files in the app**
4. **Preview transformed data**
5. **Export to MongoDB JSON**

## Supported Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - true/false (1/0, yes/no)
- `date` - ISO date strings
- `array` - Comma-separated or JSON arrays
- `object` - JSON objects

## Development

```bash
npm install
npm start
```

Open http://localhost:4200

## Example Files

- `example-schema.json` - Sample mapping configuration
- `example-data.csv` - Sample CSV data

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
