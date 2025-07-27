import { pgTable, uuid, varchar, text, boolean, timestamptz, integer, bigint, jsonb, date, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'editor'])
export const contentStatusEnum = pgEnum('content_status', ['draft', 'published', 'archived'])
export const contentTypeEnum = pgEnum('content_type', ['writing', 'page', 'snippet'])
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'document'])
export const projectStatusEnum = pgEnum('project_status', ['draft', 'published', 'archived'])

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('user'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
})

// OAuth accounts
export const oauthAccounts = pgTable('oauth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamptz('expires_at'),
  createdAt: timestamptz('created_at').defaultNow(),
})

// User sessions
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamptz('expires_at').notNull(),
  createdAt: timestamptz('created_at').defaultNow(),
})

// User preferences
export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 20 }).default('system'),
  language: varchar('language', { length: 10 }).default('en'),
  emailNotifications: boolean('email_notifications').default(true),
  aiSuggestions: boolean('ai_suggestions').default(true),
  preferences: jsonb('preferences').default('{}'),
  updatedAt: timestamptz('updated_at').defaultNow(),
})

// Content table
export const content = pgTable('content', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  type: contentTypeEnum('type').notNull(),
  status: contentStatusEnum('status').default('draft'),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  excerpt: text('excerpt'),
  body: text('body'),
  bodyHtml: text('body_html'),
  featuredImageId: uuid('featured_image_id'),
  publishedAt: timestamptz('published_at'),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
})

// Content revisions
export const contentRevisions = pgTable('content_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  title: varchar('title', { length: 500 }),
  body: text('body'),
  bodyHtml: text('body_html'),
  revisionNumber: integer('revision_number').notNull(),
  changeSummary: text('change_summary'),
  createdAt: timestamptz('created_at').defaultNow(),
})

// Content metadata
export const contentMeta = pgTable('content_meta', {
  contentId: uuid('content_id').primaryKey().references(() => content.id, { onDelete: 'cascade' }),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  readingTime: integer('reading_time'),
  seoTitle: varchar('seo_title', { length: 500 }),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords').array(),
  ogImageUrl: text('og_image_url'),
  customMeta: jsonb('custom_meta').default('{}'),
  updatedAt: timestamptz('updated_at').defaultNow(),
})

// Media library
export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  type: mediaTypeEnum('type').notNull(),
  filename: varchar('filename', { length: 500 }).notNull(),
  originalFilename: varchar('original_filename', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  storageProvider: varchar('storage_provider', { length: 50 }).notNull(),
  storagePath: text('storage_path').notNull(),
  cdnUrl: text('cdn_url'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamptz('created_at').defaultNow(),
})

// Media metadata
export const mediaMeta = pgTable('media_meta', {
  mediaId: uuid('media_id').primaryKey().references(() => media.id, { onDelete: 'cascade' }),
  width: integer('width'),
  height: integer('height'),
  duration: integer('duration'),
  altText: text('alt_text'),
  caption: text('caption'),
  exifData: jsonb('exif_data'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  processedVariants: jsonb('processed_variants').default('{}'),
  updatedAt: timestamptz('updated_at').defaultNow(),
})

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  description: text('description'),
  descriptionHtml: text('description_html'),
  featuredImageId: uuid('featured_image_id'),
  status: projectStatusEnum('status').default('draft'),
  projectUrl: text('project_url'),
  githubUrl: text('github_url'),
  demoUrl: text('demo_url'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isFeatured: boolean('is_featured').default(false),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
})

// Categories (hierarchical)
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id'),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamptz('created_at').defaultNow(),
})

// Tags (flat)
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamptz('created_at').defaultNow(),
})

// Junction tables
export const contentCategories = pgTable('content_categories', {
  contentId: uuid('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
})

export const contentTags = pgTable('content_tags', {
  contentId: uuid('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})

export const projectTags = pgTable('project_tags', {
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})

export const contentMedia = pgTable('content_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  mediaId: uuid('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  position: integer('position').default(0),
  caption: text('caption'),
  createdAt: timestamptz('created_at').defaultNow(),
})

export const projectMedia = pgTable('project_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  mediaId: uuid('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).default('gallery'),
  position: integer('position').default(0),
  caption: text('caption'),
  createdAt: timestamptz('created_at').defaultNow(),
})

// AI Integration
export const aiPrompts = pgTable('ai_prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  promptTemplate: text('prompt_template').notNull(),
  systemMessage: text('system_message'),
  parameters: jsonb('parameters').default('{}'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
})

export const aiResponses = pgTable('ai_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  promptId: uuid('prompt_id').references(() => aiPrompts.id),
  userId: uuid('user_id').references(() => users.id),
  contentId: uuid('content_id').references(() => content.id),
  requestData: jsonb('request_data').notNull(),
  responseData: jsonb('response_data').notNull(),
  tokensUsed: integer('tokens_used'),
  costCents: integer('cost_cents'),
  durationMs: integer('duration_ms'),
  createdAt: timestamptz('created_at').defaultNow(),
})

// Relations
export const userRelations = relations(users, ({ many, one }) => ({
  content: many(content),
  projects: many(projects),
  media: many(media),
  oauthAccounts: many(oauthAccounts),
  sessions: many(userSessions),
  preferences: one(userPreferences),
  aiResponses: many(aiResponses),
}))

export const contentRelations = relations(content, ({ one, many }) => ({
  author: one(users, {
    fields: [content.userId],
    references: [users.id],
  }),
  meta: one(contentMeta),
  revisions: many(contentRevisions),
  categories: many(contentCategories),
  tags: many(contentTags),
  media: many(contentMedia),
}))

export const projectRelations = relations(projects, ({ one, many }) => ({
  author: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  tags: many(projectTags),
  media: many(projectMedia),
}))

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  content: many(contentCategories),
}))

export const mediaRelations = relations(media, ({ one, many }) => ({
  author: one(users, {
    fields: [media.userId],
    references: [users.id],
  }),
  meta: one(mediaMeta),
  contentUsage: many(contentMedia),
  projectUsage: many(projectMedia),
}))