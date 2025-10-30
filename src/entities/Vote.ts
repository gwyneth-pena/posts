import { Entity, ManyToOne, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { User } from "./User.js"; 

@Entity()
export class Vote {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => 'Post' })
  post!: Ref<any>;

  @ManyToOne({ entity: () => User })
  user!: Ref<User>;

  @Property()
  value!: 1 | -1;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
