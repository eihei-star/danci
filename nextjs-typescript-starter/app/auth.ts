import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt-ts';
import { getUser } from 'app/db';
import { authConfig } from 'app/auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize({ email, password }: any) {
        let users: any = await getUser(email);
        console.log('[AUTH-DEBUG] email=', email, 'count=', users.length);
        if (users.length === 0) return null;
        let passwordsMatch = await compare(password, users[0].password!);
        console.log('[AUTH-DEBUG] match=', passwordsMatch);
        if (passwordsMatch) return users[0] as any;
      },
    }),
  ],
  callbacks: {
    // 把用户 id 塞进会话，供学习进度等接口识别当前用户
    session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
