import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Post } from "./Post.js";
import { User } from "./User.js";

@Entity()
export class Vote {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => User)
  user: User;

  @Property()
  value: 1 | -1;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
