# Posts Snowy GraphQL API

A GraphQL API for managing posts, users, comments, and votes.  

https://posts-snowy-nu.vercel.app/graphql

## Table of Contents

- [Schema](#schema)
  - [Queries](#queries)
  - [Mutations](#mutations)
  - [Types](#types)
  - [Inputs](#inputs)

---

## Schema

### Queries

| Query | Arguments | Returns |
|-------|-----------|---------|
| `posts` | `username: String`, `likedByUsername: String`, `limit: Int`, `offset: Int`, `orderBy: String` | `[Post!]!` |
| `post` | `id: ID`, `slug: String` | `Post` |
| `totalPosts` | `username: String`, `userId: ID` | `Int!` |
| `users` | - | `[User!]!` |
| `user` | `id: ID`, `username: String` | `User` |
| `userMe` | - | `User` |
| `commentsByPost` | `postId: ID!` | `[Comment!]!` |
| `votesPerLoggedInUser` | - | `[Vote!]!` |
| `votesPerPost` | `postIds: [ID!]!` | `[Vote!]!` |

### Mutations

| Mutation | Arguments | Returns |
|----------|-----------|---------|
| `createPost` | `title: String!`, `text: String!` | `Post!` |
| `updatePost` | `id: ID!`, `title: String!`, `text: String!` | `Post!` |
| `deletePost` | `id: ID!` | `Boolean!` |
| `createUser` | `data: ModifyUserInput` | `User!` |
| `updateUser` | `id: ID!`, `data: ModifyUserInput` | `User!` |
| `deleteUser` | `id: ID!` | `Boolean!` |
| `loginUser` | `username: String!`, `password: String!` | `User` |
| `sendResetPasswordEmail` | `email: String!` | `Boolean!` |
| `resetPassword` | `selector: String!`, `token: String!`, `password: String!` | `Boolean!` |
| `createComment` | `text: String!`, `postId: ID!`, `parentId: ID` | `Comment!` |
| `updateComment` | `id: ID!`, `text: String!` | `Comment!` |
| `deleteComment` | `id: ID!` | `Boolean!` |
| `createVote` | `value: Int!`, `postId: ID!` | `Vote!` |
| `updateVote` | `id: ID!`, `value: Int!` | `Vote!` |
| `updateVoteByPost` | `value: Int!`, `postId: ID!` | `Vote!` |
| `deleteVote` | `id: ID!` | `Boolean!` |
| `deleteVoteByPost` | `postId: ID!` | `Boolean!` |

---

### Types

```graphql
type Post {
  id: ID!
  title: String!
  createdAt: String!
  updatedAt: String!
  text: String!
  user: User!
  likeCount: Int!
  dislikeCount: Int!
  commentCount: Int!
  userVote: Int
  isOwner: Boolean
  slug: String!
}

type User {
  id: ID!
  username: String!
  email: String
  createdAt: String!
  updatedAt: String!
}

type Comment {
  id: ID!
  text: String!
  parent: Comment
  children: [Comment!]!
  createdAt: String!
  updatedAt: String!
  user: User!
  post: Post!
}

type Vote {
  id: ID!
  value: Int!
  createdAt: String!
  updatedAt: String!
  user: User!
  post: Post!
}


input ModifyUserInput {
  username: String!
  password: String!
  email: String
}
