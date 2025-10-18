import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User.js";

@Entity()
export class Post {

  @PrimaryKey()
  id!: number;

  @Property()
  title: string = "";

  @Property()
  text: string = "";

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne({ entity: () => User })
  user: User;

}