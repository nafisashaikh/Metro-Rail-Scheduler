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
    // Password: Metro@Admin1
    passwordSaltHex: '8c6e02c5c40e86b518afcc5f3af81430',
    passwordHashHex:
      '6a05d22b4c7c80f6d1078a008afea00d5f621da335f4d8fcd412781d6de95580e1029a06a2e65a7aacb89db8ee75563f59ae672de70b1218325e8b22c2fd26e0',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    role: 'supervisor',
    employeeId: 'MRS-S-042',
    department: 'Operations',
    identifier: 'MRS-S-042',
    // Password: Metro@Sup1
    passwordSaltHex: '7aeaabbe30a175b91798aa63f9fd0654',
    passwordHashHex:
      '5f3abc0947acc1df55b4a518691bd2f677b302eac6da8ad885d2ed9f0a0b22852ad6ac48f623b8915c8fad1eb0fd375a0eb55179090520061a6fc08c00e74cd8',
  },
  {
    id: '3',
    name: 'Amit Patil',
    role: 'employee',
    employeeId: 'MRS-E-187',
    department: 'Station Management',
    identifier: 'MRS-E-187',
    // Password: Metro@Emp1
    passwordSaltHex: '03bc59f0f7f0bf66e2ea6c5aca2f7ae6',
    passwordHashHex:
      '651ad0b257f923f09f419bb68bbb3c1ce775ec5f7e2f0af59665c09c40a5511b701e6ba16d3278d45c0ff75a776b14c951e9241a4e4d81c7df111c812c974e9e',
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
 
