import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Get all matches
router.get('/', async (req, res) => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        events:match_events (
          id,
          type,
          minute,
          player_id,
          team_id,
          description
        )
      `)
      .order('scheduled_time', { ascending: true })

    if (error) throw error

    res.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    res.status(500).json({ error: 'Failed to fetch matches' })
  }
})

// Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        events:match_events (
          id,
          type,
          minute,
          player_id,
          team_id,
          description
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    res.json(match)
  } catch (error) {
    console.error('Error fetching match:', error)
    res.status(500).json({ error: 'Failed to fetch match' })
  }
})

// Create match
router.post('/', requireAuth, async (req, res) => {
  try {
    const { tournamentId, team1Id, team2Id, scheduledTime, venue, referee } = req.body

    // Check if user is the tournament creator
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', tournamentId)
      .single()

    if (fetchError) throw fetchError
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' })
    }

    if (tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to create matches in this tournament' })
    }

    const { data: match, error: insertError } = await supabase
      .from('matches')
      .insert([
        {
          tournament_id: tournamentId,
          team1_id: team1Id,
          team2_id: team2Id,
          scheduled_time: scheduledTime,
          venue,
          referee,
          status: 'scheduled',
          team1_score: 0,
          team2_score: 0,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    res.status(201).json(match)
  } catch (error) {
    console.error('Error creating match:', error)
    res.status(500).json({ error: 'Failed to create match' })
  }
})

// Update match
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { scheduledTime, venue, referee, status } = req.body

    // Check if user is the tournament creator
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select(`
        tournament:tournaments (
          created_by
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    if (match.tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this match' })
    }

    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({
        scheduled_time: scheduledTime,
        venue,
        referee,
        status,
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (updateError) throw updateError

    res.json(updatedMatch)
  } catch (error) {
    console.error('Error updating match:', error)
    res.status(500).json({ error: 'Failed to update match' })
  }
})

// Delete match
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Check if user is the tournament creator
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select(`
        tournament:tournaments (
          created_by
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    if (match.tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this match' })
    }

    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('id', req.params.id)

    if (deleteError) throw deleteError

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting match:', error)
    res.status(500).json({ error: 'Failed to delete match' })
  }
})

// Update match score
router.post('/:id/score', requireAuth, async (req, res) => {
  try {
    const { teamId, increment } = req.body

    // Check if user is the tournament creator
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select(`
        *,
        tournament:tournaments (
          created_by
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    if (match.tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this match' })
    }

    if (match.status !== 'in_progress') {
      return res.status(400).json({ error: 'Can only update score for matches in progress' })
    }

    const update = {
      team1_score: match.team1_id === teamId
        ? Math.max(0, match.team1_score + (increment ? 1 : -1))
        : match.team1_score,
      team2_score: match.team2_id === teamId
        ? Math.max(0, match.team2_score + (increment ? 1 : -1))
        : match.team2_score,
    }

    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update(update)
      .eq('id', req.params.id)
      .select()
      .single()

    if (updateError) throw updateError

    res.json(updatedMatch)
  } catch (error) {
    console.error('Error updating match score:', error)
    res.status(500).json({ error: 'Failed to update match score' })
  }
})

// Add match event
router.post('/:id/events', requireAuth, async (req, res) => {
  try {
    const { type, minute, playerId, teamId, description } = req.body

    // Check if user is the tournament creator
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select(`
        tournament:tournaments (
          created_by
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    if (match.tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add events to this match' })
    }

    if (match.status !== 'in_progress') {
      return res.status(400).json({ error: 'Can only add events to matches in progress' })
    }

    const { data: event, error: insertError } = await supabase
      .from('match_events')
      .insert([
        {
          match_id: req.params.id,
          type,
          minute,
          player_id: playerId,
          team_id: teamId,
          description,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    // Update player statistics
    const statsUpdate: any = {}
    switch (type) {
      case 'goal':
        statsUpdate.goals = 1
        break
      case 'yellow_card':
        statsUpdate.yellow_cards = 1
        break
      case 'red_card':
        statsUpdate.red_cards = 1
        break
      case 'assist':
        statsUpdate.assists = 1
        break
    }

    if (Object.keys(statsUpdate).length > 0) {
      const { error: statsError } = await supabase
        .from('match_statistics')
        .upsert({
          match_id: req.params.id,
          player_id: playerId,
          ...statsUpdate,
        })

      if (statsError) throw statsError
    }

    res.status(201).json(event)
  } catch (error) {
    console.error('Error adding match event:', error)
    res.status(500).json({ error: 'Failed to add match event' })
  }
})

// Get match lineups
router.get('/:id/lineups', async (req, res) => {
  try {
    const { data: lineups, error } = await supabase
      .from('match_lineups')
      .select(`
        *,
        player:team_members (
          id,
          name,
          position,
          jersey_number
        )
      `)
      .eq('match_id', req.params.id)

    if (error) throw error

    res.json(lineups)
  } catch (error) {
    console.error('Error fetching match lineups:', error)
    res.status(500).json({ error: 'Failed to fetch match lineups' })
  }
})

// Update match lineup
router.post('/:id/lineups', requireAuth, async (req, res) => {
  try {
    const { teamId, players } = req.body

    // Check if user is the tournament creator
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select(`
        tournament:tournaments (
          created_by
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    if (match.tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this match lineup' })
    }

    if (match.status !== 'scheduled') {
      return res.status(400).json({ error: 'Can only update lineup for scheduled matches' })
    }

    // Delete existing lineups for the team
    const { error: deleteError } = await supabase
      .from('match_lineups')
      .delete()
      .eq('match_id', req.params.id)
      .eq('team_id', teamId)

    if (deleteError) throw deleteError

    // Insert new lineups
    const { data: lineups, error: insertError } = await supabase
      .from('match_lineups')
      .insert(
        players.map((playerId: string) => ({
          match_id: req.params.id,
          team_id: teamId,
          player_id: playerId,
        }))
      )
      .select()

    if (insertError) throw insertError

    res.status(201).json(lineups)
  } catch (error) {
    console.error('Error updating match lineup:', error)
    res.status(500).json({ error: 'Failed to update match lineup' })
  }
})

export default router 