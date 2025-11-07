import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
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

  @ManyToOne({ entity: () => Comment, nullable: true })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent, {
    orphanRemoval: true,
  })
  children = new Collection<Comment>(this);

  @Property({ columnType: "longtext" })
  text!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
