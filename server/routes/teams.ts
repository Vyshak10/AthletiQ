import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Get all teams
router.get('/', async (req, res) => {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members (
          id,
          name,
          position,
          jersey_number,
          stats:match_statistics (
            goals,
            assists,
            yellow_cards,
            red_cards
          )
        )
      `)
      .order('name', { ascending: true })

    if (error) throw error

    res.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
})

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members (
          id,
          name,
          position,
          jersey_number,
          stats:match_statistics (
            goals,
            assists,
            yellow_cards,
            red_cards
          )
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    res.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    res.status(500).json({ error: 'Failed to fetch team' })
  }
})

// Create team
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body

    const { data: team, error } = await supabase
      .from('teams')
      .insert([
        {
          name,
          manager_id: req.user.id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(team)
  } catch (error) {
    console.error('Error creating team:', error)
    res.status(500).json({ error: 'Failed to create team' })
  }
})

// Update team
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name } = req.body

    // Check if user is the team manager
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('manager_id')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    if (team.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this team' })
    }

    const { data: updatedTeam, error: updateError } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', req.params.id)
      .select()
      .single()

    if (updateError) throw updateError

    res.json(updatedTeam)
  } catch (error) {
    console.error('Error updating team:', error)
    res.status(500).json({ error: 'Failed to update team' })
  }
})

// Delete team
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Check if user is the team manager
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('manager_id')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    if (team.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this team' })
    }

    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', req.params.id)

    if (deleteError) throw deleteError

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting team:', error)
    res.status(500).json({ error: 'Failed to delete team' })
  }
})

// Add team member
router.post('/:id/members', requireAuth, async (req, res) => {
  try {
    const { name, position, jerseyNumber } = req.body

    // Check if user is the team manager
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('manager_id')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    if (team.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add members to this team' })
    }

    const { data: member, error: insertError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: req.params.id,
          name,
          position,
          jersey_number: jerseyNumber,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    res.status(201).json(member)
  } catch (error) {
    console.error('Error adding team member:', error)
    res.status(500).json({ error: 'Failed to add team member' })
  }
})

// Update team member
router.put('/:id/members/:memberId', requireAuth, async (req, res) => {
  try {
    const { name, position, jerseyNumber } = req.body

    // Check if user is the team manager
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('manager_id')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    if (team.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update members of this team' })
    }

    const { data: member, error: updateError } = await supabase
      .from('team_members')
      .update({
        name,
        position,
        jersey_number: jerseyNumber,
      })
      .eq('id', req.params.memberId)
      .eq('team_id', req.params.id)
      .select()
      .single()

    if (updateError) throw updateError
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' })
    }

    res.json(member)
  } catch (error) {
    console.error('Error updating team member:', error)
    res.status(500).json({ error: 'Failed to update team member' })
  }
})

// Delete team member
router.delete('/:id/members/:memberId', requireAuth, async (req, res) => {
  try {
    // Check if user is the team manager
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('manager_id')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    if (team.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete members from this team' })
    }

    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', req.params.memberId)
      .eq('team_id', req.params.id)

    if (deleteError) throw deleteError

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting team member:', error)
    res.status(500).json({ error: 'Failed to delete team member' })
  }
})

export default router 