import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const requiredDbVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
const missingDbVars = requiredDbVars.filter((name) => !process.env[name]);

if (missingDbVars.length > 0) {
  throw new Error(`Missing database environment variables: ${missingDbVars.join(', ')}`);
}

const schemaName = process.env.DB_NAME;

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: schemaName,
  port: Number(process.env.DB_PORT),
});

console.log('\n' + '='.repeat(110));
console.log('📊 DATABASE SCHEMA AUDIT - COMPARING schema1.sql WITH ACTUAL DATABASE');
console.log('='.repeat(110) + '\n');

const expectedSchema = {
  teachers: { columns: ['teacher_id', 'full_name', 'specialization', 'profile_image', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_teachers_display_order'] },
  students: { columns: ['student_id', 'full_name', 'email', 'phone', 'address', 'age', 'occupation', 'registered_date'], indexes: [] },
  admin_user: { columns: ['admin_id', 'username', 'password', 'created_at'], indexes: ['idx_admin_username'] },
  courses: { columns: ['course_id', 'course_name', 'slug', 'description', 'image_url', 'level', 'price', 'teacher_id', 'seo_title', 'seo_description', 'seo_keywords', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_courses_slug', 'idx_courses_display_order', 'idx_courses_teacher_id', 'idx_courses_level'] },
  gallery: { columns: ['gallery_id', 'title', 'slug', 'description', 'thumbnail_image_url', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_gallery_slug', 'idx_gallery_display_order'] },
  gallery_images: { columns: ['image_id', 'gallery_id', 'image_url', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_gallery_images_gallery_id', 'idx_gallery_images_display_order'] },
  class_schedule: { columns: ['schedule_id', 'course_id', 'teacher_id', 'class_day', 'start_time', 'end_time'], indexes: ['idx_class_schedule_course_id', 'idx_class_schedule_teacher_id'] },
  registrations: { columns: ['registration_id', 'student_id', 'course_id', 'registration_date', 'status'], indexes: [] },
  offers: { columns: ['offer_id', 'course_id', 'title', 'slug', 'subtitle', 'description', 'image_url', 'discount_percentage', 'discount_type', 'cta_text', 'cta_link', 'valid_from', 'valid_to', 'seo_title', 'seo_description', 'seo_keywords', 'display_order', 'is_active', 'created_at', 'updated_at'], indexes: ['idx_offers_slug', 'idx_offers_course_id', 'idx_offers_active'] },
  events: { columns: ['event_id', 'event_name', 'slug', 'category', 'description', 'rich_content', 'event_date', 'event_time', 'venue', 'organized_by', 'seo_title', 'seo_description', 'seo_keywords', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_events_slug', 'idx_events_display_order', 'idx_events_event_date'] },
  news: { columns: ['news_id', 'title', 'slug', 'rich_content', 'news_date', 'image_url', 'seo_title', 'seo_description', 'seo_keywords', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_news_slug', 'idx_news_date', 'idx_news_display_order'] },
  news_resources: { columns: ['resource_id', 'news_id', 'resource_type', 'resource_url', 'caption', 'sort_order', 'created_at'], indexes: [] },
  activities: { columns: ['activity_id', 'title', 'description', 'video_url', 'display_order', 'created_at', 'updated_at'], indexes: [] },
  artists: { columns: ['artist_id', 'full_name', 'slug', 'bio', 'profile_image', 'seo_title', 'seo_description', 'seo_keywords', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_artists_slug', 'idx_artists_display_order'] },
  bod: { columns: ['bod_id', 'name', 'slug', 'designation', 'bio', 'details_content', 'profile_image', 'seo_title', 'seo_description', 'seo_keywords', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_bod_slug', 'idx_bod_updated_at'] },
  programs: { columns: ['program_id', 'program_date', 'title', 'slug', 'rich_content', 'image_url', 'seo_title', 'seo_description', 'seo_keywords', 'display_order', 'created_at', 'updated_at'], indexes: ['idx_programs_slug', 'idx_programs_display_order'] },
  program_resources: { columns: ['resource_id', 'program_id', 'resource_type', 'resource_url', 'caption', 'sort_order', 'created_at'], indexes: ['idx_program_resources_program_id', 'idx_program_resources_sort_order'] },
  team_members: { columns: ['id', 'name', 'subtitle', 'description', 'image_url', 'display_order', 'created_at', 'updated_at'], indexes: [] },
  admin_audit_log: { columns: ['audit_id', 'admin_id', 'action', 'entity', 'entity_id', 'ip_address', 'created_at'], indexes: [] }
};

const [tables] = await db.query(
  'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
  [schemaName]
);

console.log(`📊 Total Tables Found in Database: ${tables.length}\n`);

let criticalIssues = 0;
let warnings = 0;
let tablesOK = 0;

for (const table of tables) {
  const tableName = table.TABLE_NAME.toLowerCase();
  const expected = expectedSchema[tableName];

  if (!expected) {
    console.log(`⚠️  UNEXPECTED: ${tableName} (in DB but not in schema1.sql)`);
    warnings++;
    continue;
  }

  const [columns] = await db.query(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
    [schemaName, tableName]
  );
  const [indexes] = await db.query(
    "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME != 'PRIMARY' ORDER BY INDEX_NAME",
    [schemaName, tableName]
  );

  const actualColumns = columns.map(c => c.COLUMN_NAME.toLowerCase());
  const expectedColumns = expected.columns.map(c => c.toLowerCase());
  const missingColumns = expectedColumns.filter(c => !actualColumns.includes(c));
  const extraColumns = actualColumns.filter(c => !expectedColumns.includes(c));

  const actualIndexes = indexes.map(i => i.INDEX_NAME.toLowerCase());
  const expectedIndexes = expected.indexes.map(i => i.toLowerCase());
  const missingIndexes = expectedIndexes.filter(i => !actualIndexes.includes(i));

  if (missingColumns.length > 0 || extraColumns.length > 0 || missingIndexes.length > 0) {
    console.log(`\n❌ ${tableName.toUpperCase()}`);
    if (missingColumns.length > 0) {
      console.log(`   ❌ CRITICAL - Missing Columns: ${missingColumns.join(', ')}`);
      criticalIssues++;
    }
    if (extraColumns.length > 0) {
      console.log(`   ⚠️  Extra Columns: ${extraColumns.join(', ')}`);
      warnings++;
    }
    if (missingIndexes.length > 0) {
      console.log(`   ⚠️  Missing Indexes: ${missingIndexes.join(', ')}`);
      warnings++;
    }
  } else {
    console.log(`✅ ${tableName.padEnd(25)} [${actualColumns.length} cols | ${actualIndexes.length} idx]`);
    tablesOK++;
  }
}

const actualTableNames = tables.map(t => t.TABLE_NAME.toLowerCase());
const missingTables = Object.keys(expectedSchema).filter(t => !actualTableNames.includes(t));

if (missingTables.length > 0) {
  console.log(`\n\n❌ MISSING TABLES (in schema1.sql but not in database):`);
  missingTables.forEach(t => console.log(`   ❌ ${t}`));
  criticalIssues += missingTables.length;
}

console.log('\n' + '='.repeat(110));
console.log(`📈 SUMMARY: ${tablesOK}/${Object.keys(expectedSchema).length} tables match | ❌ Critical: ${criticalIssues} | ⚠️  Warnings: ${warnings}`);
console.log('='.repeat(110) + '\n');

if (criticalIssues === 0 && warnings === 0) {
  console.log('✅ DATABASE SCHEMA PERFECTLY MATCHES schema1.sql!\n');
} else if (criticalIssues > 0) {
  console.log(`❌ SCHEMA INTEGRITY ISSUES: Run the following to fix:\n   mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p ${schemaName} < database/schema1.sql\n`);
}

await db.end();
