import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // user, admin, host
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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
  logo: text("logo"),
  sportId: integer("sport_id").notNull().references(() => sports.id),
  managerId: integer("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Players schema
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  jerseyNumber: integer("jersey_number"),
  dateOfBirth: text("date_of_birth"),
  profileImage: text("profile_image"),
  teamId: integer("team_id").notNull().references(() => teams.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    teamPlayerIdx: uniqueIndex("team_player_idx").on(table.teamId, table.jerseyNumber),
  };
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Tournaments schema
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sportId: integer("sport_id").notNull().references(() => sports.id),
  hostId: integer("host_id").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  status: text("status").notNull().default("upcoming"), // upcoming, active, completed
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
});

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

// Tournament Teams schema (many-to-many)
export const tournamentTeams = pgTable("tournament_teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  homeScore: integer("home_score").default(0),
  awayScore: integer("away_score").default(0),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// Lineups schema
export const lineups = pgTable("lineups", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    matchTeamIdx: uniqueIndex("match_team_idx").on(table.matchId, table.teamId),
  };
});

export const insertLineupSchema = createInsertSchema(lineups).omit({
  id: true,
  createdAt: true,
});

export type InsertLineup = z.infer<typeof insertLineupSchema>;
export type Lineup = typeof lineups.$inferSelect;

// Lineup Players schema
export const lineupPlayers = pgTable("lineup_players", {
  id: serial("id").primaryKey(),
  lineupId: integer("lineup_id").notNull().references(() => lineups.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  isStarter: boolean("is_starter").notNull().default(true),
  position: text("position").notNull(),
  enteredAt: timestamp("entered_at"),
  exitedAt: timestamp("exited_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    lineupPlayerIdx: uniqueIndex("lineup_player_idx").on(table.lineupId, table.playerId),
  };
});

export const insertLineupPlayerSchema = createInsertSchema(lineupPlayers).omit({
  id: true,
  createdAt: true,
});

export type InsertLineupPlayer = z.infer<typeof insertLineupPlayerSchema>;
export type LineupPlayer = typeof lineupPlayers.$inferSelect;

// Events schema (goals, cards, substitutions, etc.)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  playerId: integer("player_id").references(() => players.id),
  eventType: text("event_type").notNull(), // goal, yellow_card, red_card, substitution, etc.
  minute: integer("minute"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Statistics schema
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  statType: text("stat_type").notNull(), // possession, shots, fouls, etc.
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    matchTeamStatIdx: uniqueIndex("match_team_stat_idx").on(table.matchId, table.teamId, table.statType),
  };
});

export const insertStatisticSchema = createInsertSchema(statistics).omit({
  id: true,
  createdAt: true,
});

export type InsertStatistic = z.infer<typeof insertStatisticSchema>;
export type Statistic = typeof statistics.$inferSelect;

// Player Statistics schema for individual player stats
export const playerStatistics = pgTable("player_statistics", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  statType: text("stat_type").notNull(), // goals, assists, saves, etc.
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    matchPlayerStatIdx: uniqueIndex("match_player_stat_idx").on(table.matchId, table.playerId, table.statType),
  };
});

export const insertPlayerStatisticSchema = createInsertSchema(playerStatistics).omit({
  id: true,
  createdAt: true,
});

export type InsertPlayerStatistic = z.infer<typeof insertPlayerStatisticSchema>;
export type PlayerStatistic = typeof playerStatistics.$inferSelect;

// Tournament Formats schema
export const tournamentFormats = pgTable("tournament_formats", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  formatType: text("format_type").notNull(), // league, knockout, group_stage_knockout
  numberOfGroups: integer("number_of_groups"),
  teamsPerGroup: integer("teams_per_group"),
  matchesPerTeam: integer("matches_per_team"),
  advancingTeams: integer("advancing_teams"),
  thirdPlaceMatch: boolean("third_place_match").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTournamentFormatSchema = createInsertSchema(tournamentFormats).omit({
  id: true,
  createdAt: true,
});

export type InsertTournamentFormat = z.infer<typeof insertTournamentFormatSchema>;
export type TournamentFormat = typeof tournamentFormats.$inferSelect;

// Tournament Admin Actions schema to track permissions
export const tournamentAdminActions = pgTable("tournament_admin_actions", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  actionType: text("action_type").notNull(), // add_team, remove_team, update_score, reschedule, etc.
  entityId: integer("entity_id"), // ID of affected team, match, etc.
  details: text("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTournamentAdminActionSchema = createInsertSchema(tournamentAdminActions).omit({
  id: true,
  timestamp: true,
});

export type InsertTournamentAdminAction = z.infer<typeof insertTournamentAdminActionSchema>;
export type TournamentAdminAction = typeof tournamentAdminActions.$inferSelect;

// Tournament Groups schema (for group stage tournaments)
export const tournamentGroups = pgTable("tournament_groups", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  name: text("name").notNull(), // e.g., "Group A", "Group B"
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    tournamentGroupNameIdx: uniqueIndex("tournament_group_name_idx").on(table.tournamentId, table.name),
  };
});

export const insertTournamentGroupSchema = createInsertSchema(tournamentGroups).omit({
  id: true,
  createdAt: true,
});

export type InsertTournamentGroup = z.infer<typeof insertTournamentGroupSchema>;
export type TournamentGroup = typeof tournamentGroups.$inferSelect;

// Tournament Group Teams schema
export const tournamentGroupTeams = pgTable("tournament_group_teams", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => tournamentGroups.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    groupTeamIdx: uniqueIndex("group_team_idx").on(table.groupId, table.teamId),
  };
});

export const insertTournamentGroupTeamSchema = createInsertSchema(tournamentGroupTeams).omit({
  id: true,
  createdAt: true,
});

export type InsertTournamentGroupTeam = z.infer<typeof insertTournamentGroupTeamSchema>;
export type TournamentGroupTeam = typeof tournamentGroupTeams.$inferSelect;

// Authentication schema for storing refresh tokens
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
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