import { EntityManager, MikroORM } from "@mikro-orm/mysql";
import { Post } from "../../entities/Post.js";
import { User } from "../../entities/User.js";

export const postResolvers = {
  Query: {
    posts: async (_: any, __: any, { em }: MikroORM): Promise<Post[]> => {
      const posts = await em.find(
        Post,
        {},
        { orderBy: { createdAt: "DESC" }, populate: ["user"] }
      );
      return posts;
    },
    post: async (_: any, { id }: any, { em }: MikroORM): Promise<Post> => {
      const post = await em.findOne(Post, id, { populate: ["user"] });
      return post;
    },
  },
  Mutation: {
    createPost: async (
      _: any,
      { title, text }: any,
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
    ): Promise<Post> => {
      const user = await em.findOne(User, req.session.userId);
      if (!user) {
        throw new Error("User not found.");
      }
      const post = em.create(Post, { title, text, user });
      await em.persistAndFlush(post);
      return post;
    },
    updatePost: async (
      _: any,
      { id, title, text }: any,
      { em }
    ): Promise<Post> => {
      const post = await em.findOne(Post, id, { populate: ["user"] });
      if (!post) {
        throw new Error("Post not found.");
      }
      post.title = title;
      post.text = text;
      await em.persistAndFlush(post);
      return post;
    },
    deletePost: async (
      _: any,
      { id }: any,
      { em }: MikroORM
    ): Promise<Boolean> => {
      const post = await em.findOne(Post, id, { populate: ["user"] });
      if (!post) {
        throw new Error("Post not found.");
      }
      await em.removeAndFlush(post);
      return true;
    },
  },
};
