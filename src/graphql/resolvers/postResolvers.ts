import { EntityManager, MikroORM, raw } from "@mikro-orm/mysql";
import { Post } from "../../entities/Post.js";
import { User } from "../../entities/User.js";
import { Vote } from "../../entities/Vote.js";
import { Comment } from "../../entities/Comment.js";

async function getPostCounts(
  em: EntityManager,
  postIds: number[],
  options?: { includeUserVote?: boolean; userId?: number }
) {
  if (postIds.length === 0) return new Map();

  const [commentCounts, likeCounts, dislikeCounts] = await Promise.all([
    em
      .createQueryBuilder(Comment, "c")
      .select(["c.post_id as postId", raw("COUNT(c.id) as count")])
      .where({ post: { id: { $in: postIds } } })
      .groupBy("c.post_id")
      .execute() as Promise<{ postId: number; count: string }[]>,

    em
      .createQueryBuilder(Vote, "v")
      .select(["v.post_id as postId", raw("COUNT(v.id) as count")])
      .where({ value: 1, post: { id: { $in: postIds } } })
      .groupBy("v.post_id")
      .execute() as Promise<{ postId: number; count: string }[]>,

    em
      .createQueryBuilder(Vote, "v")
      .select(["v.post_id as postId", raw("COUNT(v.id) as count")])
      .where({ value: -1, post: { id: { $in: postIds } } })
      .groupBy("v.post_id")
      .execute() as Promise<{ postId: number; count: string }[]>,
  ]);

  const countsMap = new Map<
    number,
    {
      commentCount: number;
      likeCount: number;
      dislikeCount: number;
      userVote?: number;
    }
  >();

  for (const id of postIds) {
    const commentCount =
      commentCounts.find((c) => Number(c.postId) === id)?.count || 0;
    const likeCount =
      likeCounts.find((v) => Number(v.postId) === id)?.count || 0;
    const dislikeCount =
      dislikeCounts.find((v) => Number(v.postId) === id)?.count || 0;

    countsMap.set(id, {
      commentCount: Number(commentCount),
      likeCount: Number(likeCount),
      dislikeCount: Number(dislikeCount),
    });
  }

  if (options?.includeUserVote && options.userId) {
    const userVotes = await em.find(
      Vote,
      { user: options.userId, post: { id: { $in: postIds } } },
      { populate: ["post"] }
    );

    for (const vote of userVotes) {
      const postId =
        typeof vote.post === "object" && "id" in vote.post
          ? (vote.post as any).id
          : (vote.post as any);

      const entry = countsMap.get(postId);
      if (entry) entry.userVote = vote.value;
    }
  }

  return countsMap;
}

export const postResolvers = {
  Query: {
    posts: async (
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
    ): Promise<Post[]> => {
      const posts = await em.find(
        Post,
        {},
        { orderBy: { createdAt: "DESC" }, populate: ["user"] }
      );

      const postIds = posts.map((p) => p.id);
      const countsMap = await getPostCounts(em, postIds, {
        includeUserVote: !!req.session?.userId,
        userId: req.session?.userId,
      });

      const postsWithCounts = posts.map((p) => {
        const counts = countsMap.get(p.id) || {
          commentCount: 0,
          likeCount: 0,
          dislikeCount: 0,
          userVote: undefined,
        };
        return {
          ...p,
          ...counts,
          ...(req.session?.userId
            ? { isOwner: p.user.id === req.session.userId }
            : {}),
        };
      });

      return postsWithCounts;
    },
    post: async (
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
    ): Promise<any> => {
      const post = await em.findOne(Post, id, { populate: ["user"] });
      if (!post) return null;

      const countsMap = await getPostCounts(em, [post.id], {
        includeUserVote: !!req.session?.userId,
        userId: req.session?.userId,
      });

      const { commentCount, likeCount, dislikeCount } = countsMap.get(
        post.id
      ) || {
        commentCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        userVote: undefined,
      };

      return {
        ...post,
        ...(req.session?.userId
          ? { isOwner: post.user.id === req.session.userId }
          : {}),
        commentCount,
        likeCount,
        dislikeCount,
        userVote: req.session?.userId
          ? countsMap.get(post.id)?.userVote
          : undefined,
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
