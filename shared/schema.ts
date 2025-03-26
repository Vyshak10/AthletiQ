import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from 'drizzle-orm';

// User schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role").notNull().default("user"), // 'admin', 'manager', 'user'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sports schema
export const sports = pgTable("sports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  maxPlayers: integer("max_players").notNull(),
  maxSubstitutes: integer("max_substitutes").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSportSchema = createInsertSchema(sports).omit({
  id: true,
  createdAt: true,
});

export type InsertSport = z.infer<typeof insertSportSchema>;
export type Sport = typeof sports.$inferSelect;

// Teams schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sport: text("sport").notNull(),
  managerId: uuid("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Team Members schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id),
  userId: uuid("user_id").references(() => users.id),
  role: text("role").notNull(), // 'player', 'coach', 'staff'
  jerseyNumber: integer("jersey_number"),
  position: text("position"), // Sport-specific position
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Tournaments schema
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sport: text("sport").notNull(), // 'football', 'cricket', 'basketball', 'volleyball', 'athletics'
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("draft"), // 'draft', 'published', 'in_progress', 'completed'
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  settings: jsonb("settings"), // Sport-specific settings (e.g., number of overs for cricket)
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

// Tournament Teams schema (many-to-many)
export const tournamentTeams = pgTable("tournament_teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  group: text("group"), // For group stages
  seed: integer("seed"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    tournamentTeamIdx: uniqueIndex("tournament_team_idx").on(table.tournamentId, table.teamId),
  };
});

export const insertTournamentTeamSchema = createInsertSchema(tournamentTeams).omit({
  id: true,
  createdAt: true,
});

export type InsertTournamentTeam = z.infer<typeof insertTournamentTeamSchema>;
export type TournamentTeam = typeof tournamentTeams.$inferSelect;

// Matches schema
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  homeTeamId: integer("home_team_id").notNull().references(() => teams.id),
  awayTeamId: integer("away_team_id").notNull().references(() => teams.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'in_progress', 'completed'
  venue: text("venue"),
  referee: text("referee"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// Match Lineups
export const matchLineups = pgTable("match_lineups", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  teamId: integer("team_id").references(() => teams.id),
  playerId: uuid("player_id").references(() => users.id),
  position: text("position"),
  isStarting: boolean("is_starting").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    matchTeamIdx: uniqueIndex("match_team_idx").on(table.matchId, table.teamId),
  };
});

export const insertMatchLineupSchema = createInsertSchema(matchLineups).omit({
  id: true,
  createdAt: true,
});

export type InsertMatchLineup = z.infer<typeof insertMatchLineupSchema>;
export type MatchLineup = typeof matchLineups.$inferSelect;

// Match Events (goals, wickets, points, etc.)
export const matchEvents = pgTable("match_events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  eventType: text("event_type").notNull(), // 'goal', 'wicket', 'point', 'foul', etc.
  playerId: uuid("player_id").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  minute: integer("minute"),
  details: jsonb("details"), // Sport-specific event details
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    matchTeamEventIdx: uniqueIndex("match_team_event_idx").on(table.matchId, table.teamId, table.eventType),
  };
});

export const insertMatchEventSchema = createInsertSchema(matchEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;
export type MatchEvent = typeof matchEvents.$inferSelect;

// Match Statistics
export const matchStatistics = pgTable("match_statistics", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  teamId: integer("team_id").references(() => teams.id),
  stats: jsonb("stats").notNull(), // Sport-specific statistics
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    matchTeamStatIdx: uniqueIndex("match_team_stat_idx").on(table.matchId, table.teamId),
  };
});

export const insertMatchStatisticSchema = createInsertSchema(matchStatistics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMatchStatistic = z.infer<typeof insertMatchStatisticSchema>;
export type MatchStatistic = typeof matchStatistics.$inferSelect;

// Relations
export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  teams: many(tournamentTeams),
  matches: many(matches),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  tournamentTeams: many(tournamentTeams),
  homeMatches: many(matches, { relationName: 'homeTeam' }),
  awayMatches: many(matches, { relationName: 'awayTeam' }),
}));

export const matchesRelations = relations(matches, ({ many }) => ({
  lineups: many(matchLineups),
  events: many(matchEvents),
  statistics: many(matchStatistics),
}));

// Authentication schema for storing refresh tokens
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;