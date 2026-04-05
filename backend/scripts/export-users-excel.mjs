import XLSX from 'xlsx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load users from JSON
const DATA_PATH = path.resolve(__dirname, '../data/users.json');
const OUTPUT_PATH = path.resolve(__dirname, '../data/users_export.xlsx');

// Default users (passwords in plaintext for reference)
const DEFAULT_PLAIN_PASSWORDS = {
  'MRS-A-001': 'Admin@1234',
  'MRS-S-042': 'Super@1234',
  'MRS-E-187': 'Empl@1234',
  'user001':   'pass123',
  'user002':   'metro2024',
};

let users = [];

if (fs.existsSync(DATA_PATH)) {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  users = JSON.parse(raw);
} else {
  console.error('❌ users.json not found at:', DATA_PATH);
  console.log('ℹ️  Start the backend server first so it creates users.json');
  process.exit(1);
}

// Map to readable rows
const rows = users.map((user) => ({
  'ID':           user.id,
  'Name':         user.name,
  'Role':         user.role,
  'Username / Employee ID': user.username || user.employeeId || user.identifier,
  'Card Number':  user.cardNumber || '—',
  'Department':   user.department || '—',
  'Password (Plain)': DEFAULT_PLAIN_PASSWORDS[user.identifier] || '(encrypted - set during signup)',
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

console.log('✅ Excel file saved to:', OUTPUT_PATH);
console.log(`📊 Total users exported: ${rows.length}`);
