export const typeDefs = `
  type Query {
    posts: [Post!]!
    post(id: ID!): Post
    users: [User!]!
    user(id: ID!): User
    userMe: User
  }

  type Mutation {
    createPost(title: String!): Post!
    updatePost(id: ID!, title: String!): Post!
    deletePost(id: ID!): Boolean!
    createUser(data: ModifyUserInput): User!
    updateUser(id: ID!, data: ModifyUserInput): User!
    deleteUser(id: ID!): Boolean!
    loginUser(username: String!, password: String!): User
  }

  type Post {
    id: ID!
    title: String!
    createdAt: String!
    updatedAt: String!
    text: String!
    user: User!
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
`;
