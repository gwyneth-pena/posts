import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Post } from "./Post.js";
import { User } from "./User.js";

@Entity()
export class Comment {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => Post })
  post: Post;

  @ManyToOne({ entity: () => User })
  user: User;

  @Property({ columnType: "longtext" })
  text!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
