import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isExpert: true,
              canManageContent: true,
              canManageInquiry: true,
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isExpert: user.isExpert,
            canManageContent: user.canManageContent,
            canManageInquiry: user.canManageInquiry,
          }
        } catch (error) {
          console.error("Database connection error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.isExpert = user.isExpert
        token.canManageContent = user.canManageContent
        token.canManageInquiry = user.canManageInquiry
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isExpert = token.isExpert as boolean
        session.user.canManageContent = token.canManageContent as boolean
        session.user.canManageInquiry = token.canManageInquiry as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
}

declare module "next-auth" {
  interface User {
    role: string
    isExpert: boolean
    canManageContent: boolean
    canManageInquiry: boolean
  }
  
  interface Session {
    user: User & {
      id: string
      role: string
      isExpert: boolean
      canManageContent: boolean
      canManageInquiry: boolean
    }
  }
}