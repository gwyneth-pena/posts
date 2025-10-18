import { MikroORM } from "@mikro-orm/mysql";
import { Post } from "../../entities/Post.js";

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
      const post = await em.findOne(Post, id);
      return post;
    },
  },
  Mutation: {
    createPost: async (
      _: any,
      { title }: any,
      { em }: MikroORM
    ): Promise<Post> => {
      const post = em.create(Post, { title });
      await em.persistAndFlush(post);
      return post;
    },
    updatePost: async (_: any, { id, title }: any, { em }): Promise<Post> => {
      const post = await em.findOne(Post, id);
      if (!post) {
        throw new Error("Post not found.");
      }
      post.title = title;
      await em.persistAndFlush(post);
      return post;
    },
    deletePost: async (
      _: any,
      { id }: any,
      { em }: MikroORM
    ): Promise<Boolean> => {
      const post = await em.findOne(Post, id);
      if (!post) {
        throw new Error("Post not found.");
      }
      await em.removeAndFlush(post);
      return true;
    },
  },
};
