import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(tournaments)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    res.status(500).json({ error: 'Failed to fetch tournaments' })
  }
})

// Get tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' })
    }

    res.json(tournament)
  } catch (error) {
    console.error('Error fetching tournament:', error)
    res.status(500).json({ error: 'Failed to fetch tournament' })
  }
})

// Create tournament
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert([
        {
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          created_by: req.user.id,
          status: 'upcoming',
        },
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(tournament)
  } catch (error) {
    console.error('Error creating tournament:', error)
    res.status(500).json({ error: 'Failed to create tournament' })
  }
})

// Update tournament
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, description, startDate, endDate, status } = req.body

    // Check if user is the tournament creator
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' })
    }

    if (tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this tournament' })
    }

    const { data: updatedTournament, error: updateError } = await supabase
      .from('tournaments')
      .update({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        status,
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (updateError) throw updateError

    res.json(updatedTournament)
  } catch (error) {
    console.error('Error updating tournament:', error)
    res.status(500).json({ error: 'Failed to update tournament' })
  }
})

// Delete tournament
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Check if user is the tournament creator
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' })
    }

    if (tournament.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this tournament' })
    }

    const { error: deleteError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', req.params.id)

    if (deleteError) throw deleteError

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting tournament:', error)
    res.status(500).json({ error: 'Failed to delete tournament' })
  }
})

// Get tournament teams
router.get('/:id/teams', async (req, res) => {
  try {
    const { data: teams, error } = await supabase
      .from('tournament_teams')
      .select(`
        team:teams (
          id,
          name,
          manager_id,
          members:team_members (
            id,
            name,
            position,
            jersey_number
          )
        )
      `)
      .eq('tournament_id', req.params.id)

    if (error) throw error

    res.json(teams.map(t => t.team))
  } catch (error) {
    console.error('Error fetching tournament teams:', error)
    res.status(500).json({ error: 'Failed to fetch tournament teams' })
  }
})

// Get tournament matches
router.get('/:id/matches', async (req, res) => {
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
      .eq('tournament_id', req.params.id)
      .order('scheduled_time', { ascending: true })

    if (error) throw error

    res.json(matches)
  } catch (error) {
    console.error('Error fetching tournament matches:', error)
    res.status(500).json({ error: 'Failed to fetch tournament matches' })
  }
})

export default router 