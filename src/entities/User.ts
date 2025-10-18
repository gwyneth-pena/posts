import { Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Post } from "./Post.js";

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ type: "varchar", length: 255, unique: true })
  username!: string;

  @Property({ type: "text", hidden: true })
  password: string;

  @Property({ type: "text", nullable: true })
  email?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
