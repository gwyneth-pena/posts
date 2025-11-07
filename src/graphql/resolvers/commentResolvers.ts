import { EntityManager, MikroORM } from "@mikro-orm/core";
import { Comment } from "../../entities/Comment.js";
import { Post } from "../../entities/Post.js";

export const commentResolvers = {
  Query: {
    commentsByPost: async (
      _: any,
      { postId }: { postId: number },
      { em }: MikroORM
    ): Promise<Comment[]> => {
      const comments = await em.find(
        Comment,
        { post: postId, parent: null },
        { populate: ["user", "children.user"] }
      );
      return comments;
    },
  },
  Mutation: {
    createComment: async (
      _: any,
      { text, postId }: any,
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
    ): Promise<Comment> => {
      const post = await em.findOne(Post, postId, { populate: ["user"] });
      if (!post) {
        throw new Error("Post not found.");
      }
      const comment = em.create(Comment, {
        text,
        post,
        user: req.session.userId,
      });
      await em.persistAndFlush(comment);
      return em.findOneOrFail(Comment, comment.id, { populate: ["user"] });
    },
    updateComment: async (
      _: any,
      { id, text }: any,
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
    ): Promise<Comment> => {
      const comment = await em.findOne(Comment, id, { populate: ["user"] });
      if (!comment) {
        throw new Error("Comment not found.");
      }

      const isFromUser = comment.user.id === req.session.userId;
      if (!isFromUser) {
        throw new Error("You are not allowed to edit this comment.");
      }
      comment.text = text;
      await em.persistAndFlush(comment);
      return comment;
    },
    deleteComment: async (
      _: any,
      { id }: any,
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
    ): Promise<Boolean> => {
      const comment = await em.findOne(Comment, id, { populate: ["user"] });
      if (!comment) {
        throw new Error("Comment not found.");
      }

      const isFromUser = comment.user.id === req.session.userId;
      if (!isFromUser) {
        throw new Error("You are not allowed to delete this comment.");
      }
      await em.removeAndFlush(comment);
      return true;
    },
  },
};
