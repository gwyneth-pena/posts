import { commentResolvers } from "./commentResolvers.js";
import { postResolvers } from "./postResolvers.js";
import { userResolvers } from "./userResolvers.js";
import { voteResolvers } from "./voteResolvers.js";

export const resolvers = [
  postResolvers,
  userResolvers,
  commentResolvers,
  voteResolvers,
];
