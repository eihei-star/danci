import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized() {
      // H5 登录态由客户端 mock 鉴权管理（见 components/providers.tsx），
      // 页面级访问控制在对应 client 组件中完成，中间件全局放行。
      return true;
    },
  },
} satisfies NextAuthConfig;