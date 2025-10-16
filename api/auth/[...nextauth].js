import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Shopify",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: 1, name: "CJB Admin" };
        } else {
          throw new Error("Invalid password");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
