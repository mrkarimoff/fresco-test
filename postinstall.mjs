import dotenv from 'dotenv';
dotenv.config();

import { execSync } from 'child_process';

// Always run prisma generate
execSync('prisma generate', { stdio: 'inherit' });

// Only run prisma db push if VERCEL_ENV is production
// eslint-disable-next-line no-process-env
if (process.env.VERCEL_ENV === 'production') {
  execSync('prisma db push', { stdio: 'inherit' });
}
