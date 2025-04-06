export type SportType = 'football' | 'basketball' | 'volleyball' | 'cricket' | 'tennis'

export type TournamentStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'

export interface Tournament {
  id: string
  name: string
  sport: SportType
  format: string
  start_date: string
  end_date: string
  status: TournamentStatus
  description: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface TournamentStats {
  id: string
  tournament_id: string
  team_name: string
  score: number
  created_at: string
  updated_at: string
}

export interface BaseTournament {
  id: string
  name: string
  sport: SportType
  format: string
  start_date: string
  end_date: string
  status: TournamentStatus
  created_by: string
  description: string
  created_at: string
  updated_at: string
}

export interface FootballTournament extends BaseTournament {
  sport: 'football'
  format: '6s' | '7s' | '9s' | '11s'
  max_players_per_team: number
  min_players_per_team: number
  max_substitutes: number
  match_duration: number // in minutes
  half_time_duration: number // in minutes
  extra_time_duration: number // in minutes
  penalty_shootout: boolean
  offside_rule: boolean
  throw_in_rule: boolean
  corner_kick_rule: boolean
  free_kick_rule: boolean
}

export interface BasketballTournament extends BaseTournament {
  sport: 'basketball'
  format: '3v3' | '5v5'
  max_players_per_team: number
  min_players_per_team: number
  max_substitutes: number
  quarter_duration: number // in minutes
  break_duration: number // in minutes
  overtime_duration: number // in minutes
  shot_clock: number // in seconds
  three_point_line: boolean
  free_throw_line: boolean
}

export interface VolleyballTournament extends BaseTournament {
  sport: 'volleyball'
  format: 'indoor' | 'beach'
  max_players_per_team: number
  min_players_per_team: number
  max_substitutes: number
  sets_to_win: number
  points_per_set: number
  points_to_win_set: number
  points_to_win_tiebreak: number
  libero_allowed: boolean
  rotation_rule: boolean
}

export interface CricketTournament extends BaseTournament {
  sport: 'cricket'
  format: 't20' | 'one_day' | 'test'
  max_players_per_team: number
  min_players_per_team: number
  max_substitutes: number
  overs_per_innings: number
  super_over: boolean
  power_play: boolean
  drs: boolean
  no_ball_rule: boolean
  wide_ball_rule: boolean
}

export interface TennisTournament extends BaseTournament {
  sport: 'tennis'
  format: 'singles' | 'doubles' | 'mixed_doubles'
  max_players_per_team: number
  min_players_per_team: number
  games_per_set: number
  sets_to_win: number
  tiebreak_at: number
  super_tiebreak: boolean
  let_rule: boolean
  advantage_rule: boolean
}

export type Tournament = 
  | FootballTournament 
  | BasketballTournament 
  | VolleyballTournament 
  | CricketTournament 
  | TennisTournament

export interface TournamentFilters {
  sport?: SportType
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  dateRange?: {
    start: string
    end: string
  }
  search?: string
} 