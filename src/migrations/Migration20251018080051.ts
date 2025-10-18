import { Migration } from '@mikro-orm/migrations';

export class Migration20251018080051 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`username\` varchar(255) not null, \`password\` text not null, \`email\` text null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user\` add unique \`user_username_unique\`(\`username\`);`);

    this.addSql(`create table \`post\` (\`id\` int unsigned not null auto_increment primary key, \`title\` varchar(255) not null default '', \`text\` varchar(255) not null default '', \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user_id\` int unsigned not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`post\` add index \`post_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`post\` add constraint \`post_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`post\` drop foreign key \`post_user_id_foreign\`;`);

    this.addSql(`drop table if exists \`user\`;`);

    this.addSql(`drop table if exists \`post\`;`);
  }

}
