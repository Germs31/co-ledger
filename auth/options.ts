import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { connectMongo } from '@/lib/mongo';
import { UserModel } from '@/models';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) return null;
          const email = credentials.email.trim().toLowerCase();

          await connectMongo();

          let user = await UserModel.findOne({ email });

          if (!user) {
            const hash = await bcrypt.hash(credentials.password, 10);
            const created = await UserModel.create({ email, passwordHash: hash });
            return { id: created.id, email: created.email };
          }

          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) return null;
          return { id: user.id, email: user.email };
        } catch (err) {
          console.error('Authorize error', err);
          throw err;
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...(session.user ?? {}),
          id: token.id as string,
          email: token.email as string
        };
      }
      return session;
    }
  }
};
