import { AuthUser, UserRole } from '../types/auth.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportUsersToExcel } from '../utils/excel.js';

interface StoredUser extends AuthUser {
  identifier: string;
  passwordSaltHex: string;
  passwordHashHex: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_DB_PATH = path.join(DATA_DIR, 'users.json');

const DEFAULT_USERS: StoredUser[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'admin',
    employeeId: 'MRS-A-001',
    department: 'Administration',
    identifier: 'MRS-A-001',
    passwordSaltHex: '83747d63d6b2ec18638cca95b05ce107',
    passwordHashHex:
      'c8756c07405f7a18fde21788df21d9eaf152bd12559da86bb11d94310d213219096eefc0dec75a90cfb264a9cd6aa7779f9b232f70e771677160487147e6d605',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    role: 'supervisor',
    employeeId: 'MRS-S-042',
    department: 'Operations',
    identifier: 'MRS-S-042',
    passwordSaltHex: '49d9588e9a59a5591eb47bd90ea47ed5',
    passwordHashHex:
      'ef8782389c886daf8cfe0013408deb2c1511f24621bbbfc2c2026b444984904e81415740e262f04620adcc3de3ea4cf7045bad2bce567bdc46f5e56afb55ee09',
  },
  {
    id: '3',
    name: 'Amit Patil',
    role: 'employee',
    employeeId: 'MRS-E-187',
    department: 'Station Management',
    identifier: 'MRS-E-187',
    passwordSaltHex: 'e604018c7e2b4d529a89b1ff308df518',
    passwordHashHex:
      'c65441305db9692f115371d55d565f01a2911d778d78348652b58926741c6a82c3592b2b6f8d91247e84c4b268da2aafa3bb6c68f024cde12dc5fa7090e9d1e7',
  },
  {
    id: 'p001',
    name: 'Rahul Mishra',
    role: 'passenger',
    username: 'user001',
    cardNumber: 'MPC-7842',
    identifier: 'user001',
    passwordSaltHex: 'b7aa5cbeb865340125565355cd7c904d',
    passwordHashHex:
      '34a2f96ddf1bd39c81795eff62d0d549a0a4d8337b65b729fd562c00fd14ea775e966a628e763d25676cadfe4d94ba854a26fc083257d8bb3f79fb51e257600d',
  },
  {
    id: 'p002',
    name: 'Ananya Singh',
    role: 'passenger',
    username: 'user002',
    cardNumber: 'MPC-3391',
    identifier: 'user002',
    passwordSaltHex: '0cf497d5fd59bd90e399a373d9f6465b',
    passwordHashHex:
      '9fb1fc026145f32b683554d0b831f3373761fab47606ef1095fe025441a5e1124a780a30a06ebaeda0ce41460576281a8204b26663b9ed958208815bfc7ea071',
  },
];

function loadUsersFromDisk(): StoredUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(USERS_DB_PATH)) {
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
      return [...DEFAULT_USERS];
    }

    const raw = fs.readFileSync(USERS_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoredUser[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
      return [...DEFAULT_USERS];
    }

    return parsed;
  } catch {
    return [...DEFAULT_USERS];
  }
}

function saveUsersToDisk(users: StoredUser[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
  
  // Also export to Excel for external tracking
  exportUsersToExcel(users);
}

const USERS: StoredUser[] = loadUsersFromDisk();

export function findUserForLogin(role: UserRole, identifier: string): StoredUser | undefined {
  return USERS.find(
    (user) => user.role === role && user.identifier.toLowerCase() === identifier.trim().toLowerCase()
  );
}

export function findUserById(id: string): StoredUser | undefined {
  return USERS.find((user) => user.id === id);
}

export function toPublicUser(user: StoredUser): AuthUser {
  const { passwordHashHex: _hash, passwordSaltHex: _salt, identifier: _identifier, ...publicUser } = user;
  return publicUser;
}

export function isPassengerUsernameTaken(username: string): boolean {
  return USERS.some(
    (user) => user.role === 'passenger' && user.identifier.toLowerCase() === username.trim().toLowerCase()
  );
}

export function createPassengerUser(input: {
  name: string;
  username: string;
  passwordSaltHex: string;
  passwordHashHex: string;
  cardNumber?: string;
}): StoredUser {
  const normalizedUsername = input.username.trim().toLowerCase();
  const nextPassengerCount = USERS.filter((u) => u.role === 'passenger').length + 1;
  const generatedCard = input.cardNumber?.trim() || `MPC-${String(7000 + nextPassengerCount).padStart(4, '0')}`;
  const numericIds = USERS
    .map((u) => (u.id.startsWith('p') ? Number.parseInt(u.id.slice(1), 10) : Number.NaN))
    .filter((n) => Number.isFinite(n));
  const nextIdNumber = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

  const newUser: StoredUser = {
    id: `p${String(nextIdNumber).padStart(3, '0')}`,
    name: input.name.trim(),
    role: 'passenger',
    username: normalizedUsername,
    cardNumber: generatedCard,
    identifier: normalizedUsername,
    passwordSaltHex: input.passwordSaltHex,
    passwordHashHex: input.passwordHashHex,
  };

  USERS.push(newUser);
  saveUsersToDisk(USERS);
  return newUser;
}
