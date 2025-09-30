// apps/admin-web/app/lib/csv.ts
import Papa from 'papaparse';

/**
 * Convert data to CSV and trigger download
 * @param data Array of objects to convert to CSV
 * @param filename Name of the file to download
 */
export function exportToCSV<T>(data: T[], filename: string): void {
  try {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }
    
    const csv = Papa.unparse(data);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `${filename}.csv`);
    tempLink.setAttribute('hidden', 'true');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

/**
 * Parse CSV file and return data as array of objects
 * @param file CSV file to parse
 * @returns Promise that resolves to array of objects
 */
export function importFromCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(results.errors);
            return;
          }
          resolve(results.data as T[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Parse CSV string and return data as array of objects
 * @param csvString CSV string to parse
 * @returns Array of objects
 */
export function parseCSVString<T>(csvString: string): T[] {
  try {
    const results = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true
    });
    
    if (results.errors && results.errors.length > 0) {
      console.error('Errors parsing CSV string:', results.errors);
      throw new Error(`Error parsing CSV: ${results.errors[0].message}`);
    }
    
    return results.data as T[];
  } catch (error) {
    console.error('Error parsing CSV string:', error);
    throw error;
  }
}

export default {
  exportToCSV,
  importFromCSV,
  parseCSVString
};