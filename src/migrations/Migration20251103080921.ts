import { Migration } from '@mikro-orm/migrations';

export class Migration20251103080921 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`comment\` modify \`text\` longtext not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`comment\` modify \`text\` varchar(255) not null default ;`);
  }

}
