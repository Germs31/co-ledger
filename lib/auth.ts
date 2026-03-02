import { authOptions } from '@/auth/options';
import { getServerSession } from 'next-auth';

export function requireUserSession() {
  return getServerSession(authOptions);
}
