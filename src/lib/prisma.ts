import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function findNearestPackageJson(start: string) {
  let current = path.resolve(start);
  const root = path.parse(current).root;

  while (true) {
    if (fs.existsSync(path.join(current, 'package.json'))) {
      return current;
    }

    if (current === root) {
      return undefined;
    }

    current = path.dirname(current);
  }
}

function findProjectRoot() {
  const candidates = [
    process.env.PROJECT_ROOT,
    process.env.INIT_CWD,
    process.cwd(),
    moduleDir,
  ].filter((value): value is string => Boolean(value));

  for (const start of candidates) {
    const found = findNearestPackageJson(start);
    if (found) {
      return found;
    }
  }

  return process.cwd();
}

const projectRoot = findProjectRoot();
const prismaDirectory = path.join(projectRoot, 'prisma');

function normalizeSqliteUrl(rawUrl: string | undefined) {
  const defaultPath = path.join(prismaDirectory, 'dev.db');

  if (!rawUrl || rawUrl.trim().length === 0) {
    ensureDirectoryExists(path.dirname(defaultPath));
    return formatSqliteFilePath(defaultPath);
  }

  const trimmed = rawUrl.trim();

  if (!trimmed.startsWith('file:')) {
    return trimmed;
  }

  const fileSpecifier = trimmed.slice('file:'.length);

  const resolvedPath = fileSpecifier.startsWith('//')
    ? fileURLToPath(trimmed)
    : path.resolve(prismaDirectory, fileSpecifier);

  ensureDirectoryExists(path.dirname(resolvedPath));
  validateSqliteFilePath(resolvedPath);
  return formatSqliteFilePath(resolvedPath);
}

function ensureDirectoryExists(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function validateSqliteFilePath(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.warn('[prisma] database file missing at', filePath);
  }
}

function formatSqliteFilePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');
  return `file:${normalized}`;
}

const databaseUrl = process.env.DATABASE_URL?.startsWith('postgresql://') 
  ? process.env.DATABASE_URL 
  : normalizeSqliteUrl(process.env.DATABASE_URL);

if (process.env.NODE_ENV === 'development') {
  console.info('[prisma] using database', databaseUrl);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
