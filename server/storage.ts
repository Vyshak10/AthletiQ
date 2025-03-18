import {
  User, InsertUser, users,
  Sport, InsertSport, sports,
  Team, InsertTeam, teams,
  Player, InsertPlayer, players,
  Tournament, InsertTournament, tournaments,
  TournamentTeam, InsertTournamentTeam, tournamentTeams,
  Match, InsertMatch, matches,
  Lineup, InsertLineup, lineups,
  LineupPlayer, InsertLineupPlayer, lineupPlayers,
  Event, InsertEvent, events,
  Statistic, InsertStatistic, statistics,
  PlayerStatistic, InsertPlayerStatistic, playerStatistics,
  RefreshToken, InsertRefreshToken, refreshTokens
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  
  // Sport operations
  createSport(sport: InsertSport): Promise<Sport>;
  getSportById(id: number): Promise<Sport | null>;
  getSportByName(name: string): Promise<Sport | null>;
  getAllSports(): Promise<Sport[]>;
  
  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamById(id: number): Promise<Team | null>;
  getTeamsBySportId(sportId: number): Promise<Team[]>;
  getTeamsByManagerId(managerId: number): Promise<Team[]>;
  
  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayerById(id: number): Promise<Player | null>;
  getPlayersByTeamId(teamId: number): Promise<Player[]>;
  
  // Tournament operations
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getTournamentById(id: number): Promise<Tournament | null>;
  getTournamentsBySportId(sportId: number): Promise<Tournament[]>;
  getTournamentsByHostId(hostId: number): Promise<Tournament[]>;
  getActiveTournaments(): Promise<Tournament[]>;
  
  // Tournament Team operations
  addTeamToTournament(tournamentTeam: InsertTournamentTeam): Promise<TournamentTeam>;
  getTeamsByTournamentId(tournamentId: number): Promise<Team[]>;
  getTournamentsByTeamId(teamId: number): Promise<Tournament[]>;
  
  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchById(id: number): Promise<Match | null>;
  getMatchesByTournamentId(tournamentId: number): Promise<Match[]>;
  getMatchesByTeamId(teamId: number): Promise<Match[]>;
  updateMatchScore(id: number, homeScore: number, awayScore: number): Promise<Match>;
  updateMatchStatus(id: number, status: string): Promise<Match>;
  
  // Lineup operations
  createLineup(lineup: InsertLineup): Promise<Lineup>;
  getLineupById(id: number): Promise<Lineup | null>;
  getLineupByMatchAndTeam(matchId: number, teamId: number): Promise<Lineup | null>;
  publishLineup(id: number): Promise<Lineup>;
  
  // Lineup Player operations
  addPlayerToLineup(lineupPlayer: InsertLineupPlayer): Promise<LineupPlayer>;
  getLineupPlayersByLineupId(lineupId: number): Promise<LineupPlayer[]>;
  updatePlayerSubstitution(id: number, enteredAt: Date, exitedAt?: Date): Promise<LineupPlayer>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByMatchId(matchId: number): Promise<Event[]>;
  getEventsByTeamId(teamId: number): Promise<Event[]>;
  getEventsByPlayerId(playerId: number): Promise<Event[]>;
  
  // Team Statistics operations
  createStatistic(statistic: InsertStatistic): Promise<Statistic>;
  getStatisticsByMatchAndTeam(matchId: number, teamId: number): Promise<Statistic[]>;
  
  // Player Statistics operations
  createPlayerStatistic(playerStatistic: InsertPlayerStatistic): Promise<PlayerStatistic>;
  getPlayerStatisticsByMatchAndPlayer(matchId: number, playerId: number): Promise<PlayerStatistic[]>;
  getLeaderboardByTournamentAndStatType(tournamentId: number, statType: string): Promise<{ player: Player, value: number }[]>;
  getTeamLeaderboardByTournamentAndStatType(tournamentId: number, statType: string): Promise<{ team: Team, value: number }[]>;
  
  // Authentication operations
  createRefreshToken(refreshToken: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshTokenByToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(token: string): Promise<void>;
}

// Implementation using in-memory storage
export class MemStorage implements IStorage {
  private users: User[] = [];
  private sports: Sport[] = [];
  private teams: Team[] = [];
  private players: Player[] = [];
  private tournaments: Tournament[] = [];
  private tournamentTeams: TournamentTeam[] = [];
  private matches: Match[] = [];
  private lineups: Lineup[] = [];
  private lineupPlayers: LineupPlayer[] = [];
  private events: Event[] = [];
  private statistics: Statistic[] = [];
  private playerStatistics: PlayerStatistic[] = [];
  private refreshTokens: RefreshToken[] = [];
  
  private nextIds = {
    users: 1,
    sports: 1,
    teams: 1,
    players: 1,
    tournaments: 1,
    tournamentTeams: 1,
    matches: 1,
    lineups: 1,
    lineupPlayers: 1,
    events: 1,
    statistics: 1,
    playerStatistics: 1,
    refreshTokens: 1
  };

  // Initialize with default sports data
  constructor() {
    this.initializeDefaultSports();
  }

  private initializeDefaultSports() {
    const defaultSports: InsertSport[] = [
      {
        name: "Football",
        maxPlayers: 11,
        maxSubstitutes: 7,
        description: "Association football, commonly known as football or soccer",
        icon: "soccer-ball"
      },
      {
        name: "Basketball",
        maxPlayers: 5,
        maxSubstitutes: 7,
        description: "Basketball is a team sport in which two teams of five players each compete",
        icon: "basketball"
      },
      {
        name: "Cricket",
        maxPlayers: 11,
        maxSubstitutes: 4,
        description: "Cricket is a bat-and-ball game played between two teams",
        icon: "cricket"
      },
      {
        name: "Volleyball",
        maxPlayers: 6,
        maxSubstitutes: 6,
        description: "Volleyball is a team sport in which two teams of six players are separated by a net",
        icon: "volleyball"
      }
    ];

    defaultSports.forEach(sport => {
      this.createSport(sport).catch(console.error);
    });
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.nextIds.users++,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  // Sport operations
  async createSport(sport: InsertSport): Promise<Sport> {
    const existingSport = await this.getSportByName(sport.name);
    if (existingSport) {
      return existingSport;
    }
    
    const newSport: Sport = {
      ...sport,
      id: this.nextIds.sports++,
      createdAt: new Date()
    };
    this.sports.push(newSport);
    return newSport;
  }

  async getSportById(id: number): Promise<Sport | null> {
    return this.sports.find(sport => sport.id === id) || null;
  }

  async getSportByName(name: string): Promise<Sport | null> {
    return this.sports.find(sport => sport.name === name) || null;
  }

  async getAllSports(): Promise<Sport[]> {
    return [...this.sports];
  }

  // Team operations
  async createTeam(team: InsertTeam): Promise<Team> {
    const newTeam: Team = {
      ...team,
      id: this.nextIds.teams++,
      createdAt: new Date()
    };
    this.teams.push(newTeam);
    return newTeam;
  }

  async getTeamById(id: number): Promise<Team | null> {
    return this.teams.find(team => team.id === id) || null;
  }

  async getTeamsBySportId(sportId: number): Promise<Team[]> {
    return this.teams.filter(team => team.sportId === sportId);
  }

  async getTeamsByManagerId(managerId: number): Promise<Team[]> {
    return this.teams.filter(team => team.managerId === managerId);
  }

  // Player operations
  async createPlayer(player: InsertPlayer): Promise<Player> {
    const newPlayer: Player = {
      ...player,
      id: this.nextIds.players++,
      createdAt: new Date()
    };
    this.players.push(newPlayer);
    return newPlayer;
  }

  async getPlayerById(id: number): Promise<Player | null> {
    return this.players.find(player => player.id === id) || null;
  }

  async getPlayersByTeamId(teamId: number): Promise<Player[]> {
    return this.players.filter(player => player.teamId === teamId);
  }

  // Tournament operations
  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const newTournament: Tournament = {
      ...tournament,
      id: this.nextIds.tournaments++,
      createdAt: new Date()
    };
    this.tournaments.push(newTournament);
    return newTournament;
  }

  async getTournamentById(id: number): Promise<Tournament | null> {
    return this.tournaments.find(tournament => tournament.id === id) || null;
  }

  async getTournamentsBySportId(sportId: number): Promise<Tournament[]> {
    return this.tournaments.filter(tournament => tournament.sportId === sportId);
  }

  async getTournamentsByHostId(hostId: number): Promise<Tournament[]> {
    return this.tournaments.filter(tournament => tournament.hostId === hostId);
  }

  async getActiveTournaments(): Promise<Tournament[]> {
    return this.tournaments.filter(tournament => tournament.status === "active");
  }

  // Tournament Team operations
  async addTeamToTournament(tournamentTeam: InsertTournamentTeam): Promise<TournamentTeam> {
    const newTournamentTeam: TournamentTeam = {
      ...tournamentTeam,
      id: this.nextIds.tournamentTeams++,
      createdAt: new Date()
    };
    this.tournamentTeams.push(newTournamentTeam);
    return newTournamentTeam;
  }

  async getTeamsByTournamentId(tournamentId: number): Promise<Team[]> {
    const tournamentTeamIds = this.tournamentTeams
      .filter(tt => tt.tournamentId === tournamentId)
      .map(tt => tt.teamId);
    
    return this.teams.filter(team => tournamentTeamIds.includes(team.id));
  }

  async getTournamentsByTeamId(teamId: number): Promise<Tournament[]> {
    const teamTournamentIds = this.tournamentTeams
      .filter(tt => tt.teamId === teamId)
      .map(tt => tt.tournamentId);
    
    return this.tournaments.filter(tournament => teamTournamentIds.includes(tournament.id));
  }

  // Match operations
  async createMatch(match: InsertMatch): Promise<Match> {
    const newMatch: Match = {
      ...match,
      id: this.nextIds.matches++,
      createdAt: new Date()
    };
    this.matches.push(newMatch);
    return newMatch;
  }

  async getMatchById(id: number): Promise<Match | null> {
    return this.matches.find(match => match.id === id) || null;
  }

  async getMatchesByTournamentId(tournamentId: number): Promise<Match[]> {
    return this.matches.filter(match => match.tournamentId === tournamentId);
  }

  async getMatchesByTeamId(teamId: number): Promise<Match[]> {
    return this.matches.filter(match => 
      match.homeTeamId === teamId || match.awayTeamId === teamId
    );
  }

  async updateMatchScore(id: number, homeScore: number, awayScore: number): Promise<Match> {
    const match = await this.getMatchById(id);
    if (!match) {
      throw new Error(`Match with ID ${id} not found`);
    }
    
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    
    return match;
  }

  async updateMatchStatus(id: number, status: string): Promise<Match> {
    const match = await this.getMatchById(id);
    if (!match) {
      throw new Error(`Match with ID ${id} not found`);
    }
    
    match.status = status;
    
    // If the match is completed, record the end time
    if (status === "completed" && !match.endTime) {
      match.endTime = new Date();
    }
    
    return match;
  }

  // Lineup operations
  async createLineup(lineup: InsertLineup): Promise<Lineup> {
    const newLineup: Lineup = {
      ...lineup,
      id: this.nextIds.lineups++,
      createdAt: new Date()
    };
    this.lineups.push(newLineup);
    return newLineup;
  }

  async getLineupById(id: number): Promise<Lineup | null> {
    return this.lineups.find(lineup => lineup.id === id) || null;
  }

  async getLineupByMatchAndTeam(matchId: number, teamId: number): Promise<Lineup | null> {
    return this.lineups.find(lineup => 
      lineup.matchId === matchId && lineup.teamId === teamId
    ) || null;
  }

  async publishLineup(id: number): Promise<Lineup> {
    const lineup = await this.getLineupById(id);
    if (!lineup) {
      throw new Error(`Lineup with ID ${id} not found`);
    }
    
    lineup.isPublished = true;
    
    return lineup;
  }

  // Lineup Player operations
  async addPlayerToLineup(lineupPlayer: InsertLineupPlayer): Promise<LineupPlayer> {
    const newLineupPlayer: LineupPlayer = {
      ...lineupPlayer,
      id: this.nextIds.lineupPlayers++,
      createdAt: new Date()
    };
    this.lineupPlayers.push(newLineupPlayer);
    return newLineupPlayer;
  }

  async getLineupPlayersByLineupId(lineupId: number): Promise<LineupPlayer[]> {
    return this.lineupPlayers.filter(lp => lp.lineupId === lineupId);
  }

  async updatePlayerSubstitution(id: number, enteredAt: Date, exitedAt?: Date): Promise<LineupPlayer> {
    const lineupPlayer = this.lineupPlayers.find(lp => lp.id === id);
    if (!lineupPlayer) {
      throw new Error(`Lineup player with ID ${id} not found`);
    }
    
    lineupPlayer.enteredAt = enteredAt;
    if (exitedAt) {
      lineupPlayer.exitedAt = exitedAt;
    }
    
    return lineupPlayer;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Event = {
      ...event,
      id: this.nextIds.events++,
      createdAt: new Date()
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async getEventsByMatchId(matchId: number): Promise<Event[]> {
    return this.events.filter(event => event.matchId === matchId);
  }

  async getEventsByTeamId(teamId: number): Promise<Event[]> {
    return this.events.filter(event => event.teamId === teamId);
  }

  async getEventsByPlayerId(playerId: number): Promise<Event[]> {
    return this.events.filter(event => event.playerId === playerId);
  }

  // Team Statistics operations
  async createStatistic(statistic: InsertStatistic): Promise<Statistic> {
    // Check if stat already exists, if so, update
    const existingStat = this.statistics.find(s => 
      s.matchId === statistic.matchId && 
      s.teamId === statistic.teamId && 
      s.statType === statistic.statType
    );
    
    if (existingStat) {
      existingStat.value = statistic.value;
      return existingStat;
    }
    
    const newStatistic: Statistic = {
      ...statistic,
      id: this.nextIds.statistics++,
      createdAt: new Date()
    };
    this.statistics.push(newStatistic);
    return newStatistic;
  }

  async getStatisticsByMatchAndTeam(matchId: number, teamId: number): Promise<Statistic[]> {
    return this.statistics.filter(stat => 
      stat.matchId === matchId && stat.teamId === teamId
    );
  }

  // Player Statistics operations
  async createPlayerStatistic(playerStatistic: InsertPlayerStatistic): Promise<PlayerStatistic> {
    // Check if stat already exists, if so, update
    const existingStat = this.playerStatistics.find(s => 
      s.matchId === playerStatistic.matchId && 
      s.playerId === playerStatistic.playerId && 
      s.statType === playerStatistic.statType
    );
    
    if (existingStat) {
      existingStat.value = playerStatistic.value;
      return existingStat;
    }
    
    const newPlayerStatistic: PlayerStatistic = {
      ...playerStatistic,
      id: this.nextIds.playerStatistics++,
      createdAt: new Date()
    };
    this.playerStatistics.push(newPlayerStatistic);
    return newPlayerStatistic;
  }

  async getPlayerStatisticsByMatchAndPlayer(matchId: number, playerId: number): Promise<PlayerStatistic[]> {
    return this.playerStatistics.filter(stat => 
      stat.matchId === matchId && stat.playerId === playerId
    );
  }

  async getLeaderboardByTournamentAndStatType(
    tournamentId: number, 
    statType: string
  ): Promise<{ player: Player, value: number }[]> {
    // Get all matches in tournament
    const matches = await this.getMatchesByTournamentId(tournamentId);
    const matchIds = matches.map(match => match.id);
    
    // Get all player stats for these matches and the specific stat type
    const stats = this.playerStatistics.filter(stat => 
      matchIds.includes(stat.matchId) && stat.statType === statType
    );
    
    // Aggregate stats by player
    const playerStats: Map<number, number> = new Map();
    
    for (const stat of stats) {
      const currentValue = playerStats.get(stat.playerId) || 0;
      playerStats.set(stat.playerId, currentValue + stat.value);
    }
    
    // Get player data and sort
    const result: { player: Player, value: number }[] = [];
    
    for (const [playerId, value] of playerStats) {
      const player = await this.getPlayerById(playerId);
      if (player) {
        result.push({ player, value });
      }
    }
    
    // Sort by value (descending)
    result.sort((a, b) => b.value - a.value);
    
    return result;
  }

  async getTeamLeaderboardByTournamentAndStatType(
    tournamentId: number, 
    statType: string
  ): Promise<{ team: Team, value: number }[]> {
    // Get all matches in tournament
    const matches = await this.getMatchesByTournamentId(tournamentId);
    const matchIds = matches.map(match => match.id);
    
    // Get all team stats for these matches and the specific stat type
    const stats = this.statistics.filter(stat => 
      matchIds.includes(stat.matchId) && stat.statType === statType
    );
    
    // Aggregate stats by team
    const teamStats: Map<number, number> = new Map();
    
    for (const stat of stats) {
      const currentValue = teamStats.get(stat.teamId) || 0;
      teamStats.set(stat.teamId, currentValue + stat.value);
    }
    
    // Get team data and sort
    const result: { team: Team, value: number }[] = [];
    
    for (const [teamId, value] of teamStats) {
      const team = await this.getTeamById(teamId);
      if (team) {
        result.push({ team, value });
      }
    }
    
    // Sort by value (descending)
    result.sort((a, b) => b.value - a.value);
    
    return result;
  }

  // Authentication operations
  async createRefreshToken(refreshToken: InsertRefreshToken): Promise<RefreshToken> {
    const newRefreshToken: RefreshToken = {
      ...refreshToken,
      id: this.nextIds.refreshTokens++,
      createdAt: new Date()
    };
    this.refreshTokens.push(newRefreshToken);
    return newRefreshToken;
  }

  async getRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokens.find(rt => rt.token === token) || null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const index = this.refreshTokens.findIndex(rt => rt.token === token);
    if (index !== -1) {
      this.refreshTokens.splice(index, 1);
    }
  }
}

// Create a single instance of the storage
export const storage = new MemStorage();