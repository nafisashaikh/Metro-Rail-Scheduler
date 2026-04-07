import XLSX from 'xlsx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuthUser } from '../types/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants for output
const DATA_DIR = path.resolve(__dirname, '../../data');
const OUTPUT_PATH = path.join(DATA_DIR, 'users_export.xlsx');

// Default users plain passwords for reference (keep in sync with script)
const DEFAULT_PLAIN_PASSWORDS: Record<string, string> = {
  'MRS-A-001': 'Admin@1234',
  'MRS-S-042': 'Super@1234',
  'MRS-E-187': 'Empl@1234',
  'user001':   'pass123',
  'user002':   'metro2024',
};

export async function exportUsersToExcel(users: any[]): Promise<void> {
  try {
    // Map to readable rows
    const rows = users.map((user) => ({
      'ID':           user.id,
      'Name':         user.name,
      'Role':         user.role,
      'Username / Employee ID': user.username || user.employeeId || user.identifier,
      'Card Number':  user.cardNumber || '—',
      'Department':   user.department || '—',
      'Password (Plain)': DEFAULT_PLAIN_PASSWORDS[user.identifier] || '(set during signup)',
      'Login Identifier': user.identifier,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 14 },
      { wch: 24 },
      { wch: 14 },
      { wch: 22 },
      { wch: 30 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, OUTPUT_PATH);
    
    console.log(`[Excel] Updated excel export with ${rows.length} users at ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('[Excel] Failed to export users to excel:', error);
  }
}
