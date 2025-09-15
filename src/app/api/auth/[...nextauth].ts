// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    // ✅ Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Your existing login/signup system (Credentials)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Real DB check
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

  callbacks: {
    async signIn({ user, account, profile }) {
      // Only run for OAuth logins
      if (account?.provider === "google") {
        try {
          const { connect } = await import("@/dbConfig/dbConfig");
          const User = (await import("@/models/userModel")).default;
          await connect();
          // Try to find user by email
          let dbUser = await User.findOne({ email: user.email });
          if (!dbUser) {
            // Always set username and email
            let username = (user.name || "").trim();
            if (!username) {
              username = user.email?.split("@")[0] || "user";
            }
            // Ensure username is unique
            let uniqueUsername = username;
            let counter = 1;
            while (await User.findOne({ username: uniqueUsername })) {
              uniqueUsername = `${username}${counter}`;
              counter++;
            }
            dbUser = await User.create({
              username: uniqueUsername,
              email: user.email,
              password: "", // No password for OAuth
              isVerified: true,
              isAdmin: false,
            });
            console.log("[NextAuth] Created new user:", dbUser);
          } else {
            console.log("[NextAuth] Found existing user:", dbUser.email);
          }
          // Attach db user id to user object for session/jwt
          user.id = dbUser._id.toString();
        } catch (err) {
          console.error("[NextAuth] Error creating/finding user:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Always use MongoDB ObjectId as user id
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.isVerified = user.isVerified;
  } else if (token.email && (!token.id || (typeof token.id === 'string' && token.id.length !== 24))) {
        // If token.id is not a valid ObjectId, fetch from DB by email
        try {
          const { connect } = await import("@/dbConfig/dbConfig");
          const User = (await import("@/models/userModel")).default;
          await connect();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.isAdmin = dbUser.isAdmin;
            token.isVerified = dbUser.isVerified;
          }
        } catch (err) {
          console.error("[NextAuth][jwt] Error fetching user by email:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Attach MongoDB user id to session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean | undefined;
        session.user.isVerified = token.isVerified as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // your login page
  },
})

export { handler as GET, handler as POST }
