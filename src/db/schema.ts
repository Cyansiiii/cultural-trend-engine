import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

// Trends table - main trends data
export const trends = sqliteTable('trends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  volume: integer('volume').notNull(),
  velocity: integer('velocity').notNull(),
  sentiment: text('sentiment').notNull(), // "positive" | "neutral" | "negative"
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  slugIdx: index('trends_slug_idx').on(table.slug),
}));

// Trend tags - many tags per trend
export const trendTags = sqliteTable('trend_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trendId: integer('trend_id').references(() => trends.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
}, (table) => ({
  trendIdIdx: index('trend_tags_trend_id_idx').on(table.trendId),
}));

// Trend velocity points - 12 data points for trends chart
export const trendVelocityPoints = sqliteTable('trend_velocity_points', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trendId: integer('trend_id').references(() => trends.id, { onDelete: 'cascade' }),
  periodIndex: integer('period_index').notNull(), // 0..11 for last 12 periods
  value: integer('value').notNull(),
}, (table) => ({
  trendIdIdx: index('trend_velocity_points_trend_id_idx').on(table.trendId),
}));

// Trend regions - regional interest data
export const trendRegions = sqliteTable('trend_regions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trendId: integer('trend_id').references(() => trends.id, { onDelete: 'cascade' }),
  region: text('region').notNull(),
  interest: integer('interest').notNull(), // 0..100
}, (table) => ({
  trendIdIdx: index('trend_regions_trend_id_idx').on(table.trendId),
}));

// Trend posts - sample social media posts for trends
export const trendPosts = sqliteTable('trend_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trendId: integer('trend_id').references(() => trends.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  content: text('content').notNull(),
  sentiment: text('sentiment').notNull(), // "positive" | "neutral" | "negative"
  postedAt: text('posted_at').notNull(),
}, (table) => ({
  trendIdIdx: index('trend_posts_trend_id_idx').on(table.trendId),
}));

// Trend demographics - age and gender breakdown
export const trendDemographics = sqliteTable('trend_demographics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trendId: integer('trend_id').references(() => trends.id, { onDelete: 'cascade' }),
  group: text('group').notNull(), // "age" | "gender"
  label: text('label').notNull(), // e.g., "18-24", "Female"
  value: integer('value').notNull(), // percentage 0..100
}, (table) => ({
  trendIdIdx: index('trend_demographics_trend_id_idx').on(table.trendId),
}));


// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});