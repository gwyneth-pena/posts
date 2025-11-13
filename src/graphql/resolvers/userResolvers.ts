import { MikroORM } from "@mikro-orm/core";
import { User } from "../../entities/User.js";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/mysql";
import { sendMail } from "../../email/mailer.js";
import { PasswordToken } from "../../schema/passwordTokenSchema.js";
import crypto from "crypto";

export const userResolvers = {
  Query: {
    users: async (
      _: any,
      __: any,
      { em }: MikroORM
    ): Promise<Omit<User, "password">[]> => {
      const users = await em.find(User, {}, { orderBy: { createdAt: "DESC" } });
      return users.map(sanitizeUser);
    },
    user: async (
      _: any,
      { id, username }: any,
      { em }: MikroORM
    ): Promise<Omit<User, "password">> => {
      let user: User;
      if (id) {
        user = await em.findOne(User, id);
      } else if (username) {
        user = await em.findOne(User, { username });
      }
      return sanitizeUser(user);
    },
    userMe: async (
      _: any,
      __: any,
      {
        em,
        req,
      }: {
        em: EntityManager;
        req: {
          session: {
            userId: number;
          };
        };
      }
    ): Promise<Omit<User, "password">> => {
      const user = await em.findOne(User, req.session.userId);
      console.log(user, "USER ME TEST");
      return sanitizeUser(user);
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      {
        data,
      }: { data: { username: string; password: string; email?: string } },
      {
        em,
        req,
      }: {
        em: EntityManager;
        req: {
          session: {
            userId: number;
          };
        };
      }
    ): Promise<Omit<User, "password">> => {
      const hashedPassword = await argon2.hash(data.password);
      const user = em.create(User, {
        username: data.username?.toUpperCase(),
        password: hashedPassword,
        email: data.email,
      });
      await em.persistAndFlush(user);
      req.session.userId = user.id;
      return sanitizeUser(user);
    },
    updateUser: async (
      _: any,
      {
        id,
        data,
      }: {
        id: number;
        data: { username: string; password: string; email?: string };
      },
      { em }: MikroORM
    ): Promise<Omit<User, "password">> => {
      const user = await em.findOne(User, id);
      if (!user) {
        throw new Error("User not found.");
      }
      const hashedPassword = await argon2.hash(data.password);
      user.username = data.username;
      user.password = hashedPassword;
      user.email = data.email;
      await em.persistAndFlush(user);
      return sanitizeUser(user);
    },
    deleteUser: async (
      _: any,
      { id }: any,
      { em }: MikroORM
    ): Promise<Boolean> => {
      const user = await em.findOne(User, id);
      if (!user) {
        throw new Error("User not found.");
      }
      await em.removeAndFlush(user);
      return true;
    },
    loginUser: async (
      _: any,
      { username, password }: { username: string; password: string },
      {
        em,
        req,
      }: {
        em: EntityManager;
        req: {
          session: {
            userId: number;
          };
        };
      }
    ): Promise<Omit<User, "password">> => {
      const user = await em.findOne(User, { username });
      if (!user) {
        throw new Error("User not found.");
      }
      const isPasswordCorrect = await argon2.verify(user.password, password);
      if (!isPasswordCorrect) {
        throw new Error("Invalid credentials");
      }

      req.session.userId = user.id;
      return sanitizeUser(user);
    },
    sendResetPasswordEmail: async (
      _: any,
      { email }: { email: string },
      { em }: MikroORM
    ): Promise<Boolean> => {
      const user = await em.findOne(User, { email });
      if (!user) {
        throw new Error("User not found.");
      }
      const selector = crypto.randomBytes(8).toString("hex");
      const rawToken = crypto.randomBytes(32).toString("hex");
      const resetToken = await argon2.hash(rawToken);

      const doc = await PasswordToken.create({
        selector: selector,
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      });
      await doc.save();
      const resetLink = `${process.env.FRONTEND_URL}/forgot-password?token=${rawToken}&selector=${selector}`;
      await sendMail(email, resetLink);
      return true;
    },
    resetPassword: async (
      _: any,
      {
        selector,
        token,
        password,
      }: { selector: string; token: string; password: string },
      { em }: MikroORM
    ): Promise<Boolean> => {
      const tokenDoc = await PasswordToken.findOne({ selector });
      if (!tokenDoc) {
        throw new Error("Invalid token.");
      }
      const matched = await argon2.verify(tokenDoc.token, token);
      if (!matched) {
        throw new Error("Invalid token.");
      }

      const user = await em.findOne(User, tokenDoc.userId);
      if (!user) {
        throw new Error("Invalid token.");
      }
      const hashedPassword = await argon2.hash(password);
      user.password = hashedPassword;
      await em.persistAndFlush(user);
      await tokenDoc.deleteOne();
      return true;
    },
  },
};

function sanitizeUser(user: User): Omit<User, "password"> {
  const { password, ...safeUser } = user;
  return safeUser;
}
