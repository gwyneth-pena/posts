import { Migration } from '@mikro-orm/migrations';

export class Migration20251029080109 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`comment\` (\`id\` int unsigned not null auto_increment primary key, \`post_id\` int unsigned not null, \`user_id\` int unsigned not null, \`text\` varchar(255) not null default '', \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`comment\` add index \`comment_post_id_index\`(\`post_id\`);`);
    this.addSql(`alter table \`comment\` add index \`comment_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`vote\` (\`id\` int unsigned not null auto_increment primary key, \`post_id\` int unsigned not null, \`user_id\` int unsigned not null, \`value\` int not null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`vote\` add index \`vote_post_id_index\`(\`post_id\`);`);
    this.addSql(`alter table \`vote\` add index \`vote_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`comment\` add constraint \`comment_post_id_foreign\` foreign key (\`post_id\`) references \`post\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`comment\` add constraint \`comment_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`vote\` add constraint \`vote_post_id_foreign\` foreign key (\`post_id\`) references \`post\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`vote\` add constraint \`vote_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`comment\`;`);

    this.addSql(`drop table if exists \`vote\`;`);
  }

}
