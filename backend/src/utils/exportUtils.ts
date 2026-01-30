import { stringify } from 'csv-stringify/sync';
import ExcelJS from 'exceljs';

export class ExportUtils {
  /**
   * Convert query results to CSV format
   */
  static toCSV(rows: any[]): string {
    if (rows.length === 0) {
      return '';
    }

    const columns = Object.keys(rows[0]);
    const data = [columns, ...rows.map(row => columns.map(col => row[col]))];

    return stringify(data, {
      header: false,
      quoted: true,
      quoted_empty: true
    });
  }

  /**
   * Convert query results to Excel buffer
   */
  static async toExcel(rows: any[], sheetName: string = 'Results'): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (rows.length === 0) {
      return await workbook.xlsx.writeBuffer();
    }

    // Add header row
    const columns = Object.keys(rows[0]);
    worksheet.columns = columns.map(col => ({
      header: col,
      key: col,
      width: 15
    }));

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    rows.forEach(row => {
      worksheet.addRow(row);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Convert query results to JSON format
   */
  static toJSON(rows: any[]): string {
    return JSON.stringify(rows, null, 2);
  }

  /**
   * Get content type for export format
   */
  static getContentType(format: 'csv' | 'excel' | 'json'): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'json':
        return 'application/json';
      default:
        return 'text/plain';
    }
  }

  /**
   * Get file extension for export format
   */
  static getFileExtension(format: 'csv' | 'excel' | 'json'): string {
    switch (format) {
      case 'csv':
        return 'csv';
      case 'excel':
        return 'xlsx';
      case 'json':
        return 'json';
      default:
        return 'txt';
    }
  }
}
