import { Migration } from '@mikro-orm/migrations';

export class Migration20251107071447 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`comment\` add \`parent_id\` int unsigned null;`);
    this.addSql(`alter table \`comment\` add constraint \`comment_parent_id_foreign\` foreign key (\`parent_id\`) references \`comment\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`comment\` add index \`comment_parent_id_index\`(\`parent_id\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`comment\` drop foreign key \`comment_parent_id_foreign\`;`);

    this.addSql(`alter table \`comment\` drop index \`comment_parent_id_index\`;`);
    this.addSql(`alter table \`comment\` drop column \`parent_id\`;`);
  }

}
