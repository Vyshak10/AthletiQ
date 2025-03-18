import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { adminAuth } from "./firebase-admin";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import './types';

// Authentication middleware
async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Protected routes middleware
  app.use([
    '/api/tournaments/preferred',
    '/api/profile',
    '/api/teams',
    '/api/matches'
  ], verifyAuth);

  // User profile routes
  app.get('/api/profile', async (req, res) => {
    try {
      const user = await storage.getUserById(parseInt(req.user.uid));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Tournament routes
  app.get('/api/tournaments', async (req, res) => {
    try {
      const tournaments = await storage.getActiveTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/tournaments/:id', async (req, res) => {
    try {
      const tournament = await storage.getTournamentById(parseInt(req.params.id));
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      res.json(tournament);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Match routes
  app.get('/api/matches/:id', async (req, res) => {
    try {
      const match = await storage.getMatchById(parseInt(req.params.id));
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      res.json(match);
    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Match statistics and events
  app.get('/api/matches/:id/statistics', async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      const match = await storage.getMatchById(matchId);
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }

      const homeStats = await storage.getStatisticsByMatchAndTeam(matchId, match.homeTeamId);
      const awayStats = await storage.getStatisticsByMatchAndTeam(matchId, match.awayTeamId);
      
      res.json({
        homeTeam: homeStats,
        awayTeam: awayStats
      });
    } catch (error) {
      console.error('Error fetching match statistics:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/matches/:id/events', async (req, res) => {
    try {
      const events = await storage.getEventsByMatchId(parseInt(req.params.id));
      res.json(events);
    } catch (error) {
      console.error('Error fetching match events:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Team routes
  app.get('/api/teams/:id', async (req, res) => {
    try {
      const team = await storage.getTeamById(parseInt(req.params.id));
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.json(team);
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/teams/:id/players', async (req, res) => {
    try {
      const players = await storage.getPlayersByTeamId(parseInt(req.params.id));
      res.json(players);
    } catch (error) {
      console.error('Error fetching team players:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Tournament leaderboards
  app.get('/api/tournaments/:id/leaderboard/players/:statType', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboardByTournamentAndStatType(
        parseInt(req.params.id),
        req.params.statType
      );
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching player leaderboard:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/tournaments/:id/leaderboard/teams/:statType', async (req, res) => {
    try {
      const leaderboard = await storage.getTeamLeaderboardByTournamentAndStatType(
        parseInt(req.params.id),
        req.params.statType
      );
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching team leaderboard:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Sport routes
  app.get('/api/sports', async (req, res) => {
    try {
      const sports = await storage.getAllSports();
      res.json(sports);
    } catch (error) {
      console.error('Error fetching sports:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}