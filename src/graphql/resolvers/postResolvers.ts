import { EntityManager, MikroORM } from "@mikro-orm/mysql";
import { Post } from "../../entities/Post.js";
import { User } from "../../entities/User.js";
import { Vote } from "../../entities/Vote.js";
import { Comment } from "../../entities/Comment.js";

export const postResolvers = {
  Query: {
    posts: async (_: any, __: any, { em }: MikroORM): Promise<Post[]> => {
      const posts = await em.find(
        Post,
        {},
        { orderBy: { createdAt: "DESC" }, populate: ["user"] }
      );
      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          const [commentCount, likeCount, dislikeCount] = await Promise.all([
            em.count(Comment, { post }),
            em.count(Vote, { post, value: 1 }),
            em.count(Vote, { post, value: -1 }),
          ]);

          return {
            ...post,
            commentCount,
            likeCount,
            dislikeCount,
          };
        })
      );
      return postsWithCounts;
    },
    post: async (_: any, { id }: any, { em }: MikroORM): Promise<any> => {
      const post = await em.findOne(Post, id, { populate: ["user"] });

      const [commentCount, likeCount, dislikeCount] = await Promise.all([
        em.count(Comment, { post }),
        em.count(Vote, { post, value: 1 }),
        em.count(Vote, { post, value: -1 }),
      ]);

      return {
        ...post,
        commentCount,
        likeCount,
        dislikeCount,
      };
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
