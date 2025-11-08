import { Migration } from '@mikro-orm/migrations';

export class Migration20251108015634 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`post\` add \`slug\` varchar(255) not null;`);
    this.addSql(`alter table \`post\` add unique \`post_slug_unique\`(\`slug\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`post\` drop index \`post_slug_unique\`;`);
    this.addSql(`alter table \`post\` drop column \`slug\`;`);
  }

}
