import { EntityManager } from "@mikro-orm/core";
import { Vote } from "../../entities/Vote.js";
import { Post } from "../../entities/Post.js";

export const voteResolvers = {
  Query: {
    votesPerLoggedInUser: async (
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
    ): Promise<any> => {
      if (req.session.userId === null) {
        throw new Error("User not logged in.");
      }
      const votes = await em.find(
        Vote,
        {
          user: req.session.userId,
        },
        { populate: ["user"] }
      );
      return votes;
    },
    votesPerPost: async (
      _: any,
      { postIds }: { postIds: number[] },
      { em }: any
    ): Promise<any> => {
      const votes = await em.find(
        Vote,
        { post: { id: { $in: postIds } } },
        { populate: ["user"] }
      );
      return votes;
    },
  },
  Mutation: {
    createVote: async (
      _: any,
      { value, postId }: { value: 1 | -1; postId: number },
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
    ): Promise<any> => {
      if (!req.session.userId) {
        throw new Error("User not logged in.");
      }
      const votedPost = await em.findOne(Vote, { post: postId });
      if (votedPost) {
        throw new Error("Post already voted.");
      }
      const post = await em.findOne(
        Post,
        { id: postId },
        { populate: ["user"] }
      );
      if (!post) {
        throw new Error("Post not found.");
      }
      const vote = em.create(Vote, {
        value,
        post: postId,
        user: req.session.userId,
      });
      await em.persistAndFlush(vote);
      return vote;
    },
    updateVote: async (
      _: any,
      { id, value }: { id: number; value: 1 | -1 },
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
    ): Promise<any> => {
      if (!req.session.userId) {
        throw new Error("User not logged in.");
      }
      const vote = await em.findOne(Vote, id, { populate: ["user"] });
      if (!vote) {
        throw new Error("Vote not found.");
      }
      const isFromUser = vote.user.id === req.session.userId;
      if (!isFromUser) {
        throw new Error("You are not allowed to edit this vote.");
      }
      vote.value = value;
      await em.persistAndFlush(vote);
      return vote;
    },
    deleteVote: async (
      _: any,
      { id }: { id: number },
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
    ): Promise<any> => {
      if (!req.session.userId) {
        throw new Error("User not logged in.");
      }
      const vote = await em.findOne(Vote, id, { populate: ["user"] });
      if (!vote) {
        throw new Error("Vote not found.");
      }
      const isFromUser = vote.user.id === req.session.userId;
      if (!isFromUser) {
        throw new Error("You are not allowed to delete this vote.");
      }
      await em.removeAndFlush(vote);
      return true;
    },
  },
};
