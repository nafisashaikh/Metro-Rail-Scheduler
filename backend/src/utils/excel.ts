import XLSX from 'xlsx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants for output
const DATA_DIR = path.resolve(__dirname, '../../data');
const OUTPUT_PATH = path.join(DATA_DIR, 'users_export.xlsx');

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
      'Password Storage': 'Hashed (scrypt + salt)',
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
