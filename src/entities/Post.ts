import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { User } from "./User.js";
import { Vote } from "./Vote.js";
import { Comment } from "./Comment.js";

@Entity()
export class Post {
  @PrimaryKey()
  id!: number;

  @Property()
  title: string = "";

  @Property({ columnType: "longtext" })
  text!: string;

  @Property({ length: 255, nullable: false, unique: true })
  slug!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne({ entity: () => User })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments = new Collection<Comment>(this);

  @OneToMany(() => Vote, (vote) => vote.post)
  votes = new Collection<Vote>(this);
}
