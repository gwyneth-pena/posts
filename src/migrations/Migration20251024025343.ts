import { Migration } from '@mikro-orm/migrations';

export class Migration20251024025343 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`user\` modify \`email\` varchar(255) not null;`);
    this.addSql(`alter table \`user\` add unique \`user_email_unique\`(\`email\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` drop index \`user_email_unique\`;`);

    this.addSql(`alter table \`user\` modify \`email\` text not null;`);
  }

}
