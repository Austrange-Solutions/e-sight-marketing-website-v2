import { type NextAuthOptions, type Session, type User, type Account, type Profile } from "next-auth";
import { type JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { connect } = await import("@/dbConfig/dbConfig");
        const User = (await import("@/models/userModel")).default;
        const bcryptjs = (await import("bcryptjs")).default;
        await connect();
        if (!credentials?.email || !credentials?.password) return null;
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        const validPassword = await bcryptjs.compare(credentials.password, user.password);
        if (!validPassword) return null;
        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { connect } = await import('@/dbConfig/dbConfig');
        const UserModel = (await import('@/models/userModel')).default;
        await connect();
        const existing = await UserModel.findOne({ email: user.email });
        if (!existing) {
          await UserModel.create({
            username: user.name || user.email?.split('@')[0] || 'GoogleUser',
            email: user.email,
            password: Math.random().toString(36).slice(-16) + Date.now().toString(36),
            isVerified: true,
            isAdmin: false,
          });
        }
      }
      return true;
    },
  async session({ session, token, user }: { session: Session, token: JWT, user?: User }) {
      if (session.user) {
        const tokenObj = token as Record<string, unknown>;
        session.user.id = user?.id || (tokenObj.id as string) || session.user.id;
        session.user.isAdmin = user?.isAdmin || (tokenObj.isAdmin as boolean) || session.user.isAdmin;
        session.user.isVerified = user?.isVerified || (tokenObj.isVerified as boolean) || session.user.isVerified;
      }
      return session;
    },
  async jwt({ token, user }: { token: JWT, user?: User, account?: Account | null, profile?: Profile }) {
      if (user) {
        const tokenObj = token as Record<string, unknown>;
        tokenObj.id = user.id;
        tokenObj.isAdmin = (user as unknown as Record<string, unknown>).isAdmin;
        tokenObj.isVerified = (user as unknown as Record<string, unknown>).isVerified;
      }
      return token;
    },
  },
};
