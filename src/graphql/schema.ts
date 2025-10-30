export const typeDefs = `
  type Query {
    posts: [Post!]!
    post(id: ID!): Post
    users: [User!]!
    user(id: ID!): User
    userMe: User
    commentsByPost(postId: ID!): [Comment!]!
    votesPerLoggedInUser: [Vote!]!
    votesPerPost(postIds: [ID!]!): [Vote!]!
  }

  type Mutation {
    createPost(title: String!, text: String!): Post!
    updatePost(id: ID!, title: String!, text: String!): Post!
    deletePost(id: ID!): Boolean!
    createUser(data: ModifyUserInput): User!
    updateUser(id: ID!, data: ModifyUserInput): User!
    deleteUser(id: ID!): Boolean!
    loginUser(username: String!, password: String!): User
    sendResetPasswordEmail(email: String!): Boolean!
    resetPassword(selector: String!, token: String!, password: String!): Boolean!
    createComment(text: String!, postId: ID!): Comment!
    updateComment(id: ID!, text: String!): Comment!
    deleteComment(id: ID!): Boolean!
    createVote(value: Int!, postId: ID!): Vote!
    updateVote(id: ID!, value: Int!): Vote!
    deleteVote(id: ID!): Boolean!
  }

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
  }

  input ModifyUserInput {
    username: String!
    password: String!
    email: String
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
`;
