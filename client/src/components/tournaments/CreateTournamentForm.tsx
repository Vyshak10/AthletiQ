import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { SportType, Tournament } from '../../types/tournament'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Switch } from '../ui/switch'
import { useToast } from '../ui/use-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sport: z.enum(['football', 'basketball', 'volleyball', 'cricket', 'tennis']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  description: z.string().min(1, 'Description is required'),
})

const footballSchema = baseSchema.extend({
  sport: z.literal('football'),
  format: z.enum(['6s', '7s', '9s', '11s']),
  max_players_per_team: z.number().min(6).max(11),
  min_players_per_team: z.number().min(6).max(11),
  max_substitutes: z.number().min(0).max(5),
  match_duration: z.number().min(30).max(120),
  half_time_duration: z.number().min(5).max(15),
  extra_time_duration: z.number().min(5).max(30),
  penalty_shootout: z.boolean(),
  offside_rule: z.boolean(),
  throw_in_rule: z.boolean(),
  corner_kick_rule: z.boolean(),
  free_kick_rule: z.boolean(),
})

const basketballSchema = baseSchema.extend({
  sport: z.literal('basketball'),
  format: z.enum(['3v3', '5v5']),
  max_players_per_team: z.number().min(3).max(5),
  min_players_per_team: z.number().min(3).max(5),
  max_substitutes: z.number().min(0).max(7),
  quarter_duration: z.number().min(5).max(12),
  break_duration: z.number().min(1).max(5),
  overtime_duration: z.number().min(3).max(5),
  shot_clock: z.number().min(14).max(30),
  three_point_line: z.boolean(),
  free_throw_line: z.boolean(),
})

const volleyballSchema = baseSchema.extend({
  sport: z.literal('volleyball'),
  format: z.enum(['indoor', 'beach']),
  max_players_per_team: z.number().min(6).max(6),
  min_players_per_team: z.number().min(6).max(6),
  max_substitutes: z.number().min(0).max(6),
  sets_to_win: z.number().min(2).max(5),
  points_per_set: z.number().min(15).max(25),
  points_to_win_set: z.number().min(15).max(25),
  points_to_win_tiebreak: z.number().min(15).max(15),
  libero_allowed: z.boolean(),
  rotation_rule: z.boolean(),
})

const cricketSchema = baseSchema.extend({
  sport: z.literal('cricket'),
  format: z.enum(['t20', 'one_day', 'test']),
  max_players_per_team: z.number().min(11).max(11),
  min_players_per_team: z.number().min(11).max(11),
  max_substitutes: z.number().min(0).max(4),
  overs_per_innings: z.number().min(20).max(50),
  super_over: z.boolean(),
  power_play: z.boolean(),
  drs: z.boolean(),
  no_ball_rule: z.boolean(),
  wide_ball_rule: z.boolean(),
})

const tennisSchema = baseSchema.extend({
  sport: z.literal('tennis'),
  format: z.enum(['singles', 'doubles', 'mixed_doubles']),
  max_players_per_team: z.number().min(1).max(2),
  min_players_per_team: z.number().min(1).max(2),
  sets_to_win: z.number().min(2).max(5),
  games_per_set: z.number().min(6).max(6),
  tiebreak_at: z.number().min(6).max(6),
  super_tiebreak: z.boolean(),
  let_rule: z.boolean(),
  advantage_rule: z.boolean(),
})

const tournamentSchema = z.discriminatedUnion('sport', [
  footballSchema,
  basketballSchema,
  volleyballSchema,
  cricketSchema,
  tennisSchema,
])

type TournamentFormData = z.infer<typeof tournamentSchema>

export function CreateTournamentForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      sport: 'football',
      status: 'draft',
    },
  })

  const onSubmit = async (data: TournamentFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('tournaments').insert([
        {
          ...data,
          created_by: user.id,
          status: 'draft',
        },
      ])

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Tournament created successfully',
      })
      navigate('/tournaments')
    } catch (error) {
      console.error('Error creating tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to create tournament',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSportSpecificFields = () => {
    const sport = form.watch('sport')

    switch (sport) {
      case 'football':
        return (
          <>
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="6s">6-a-side</SelectItem>
                      <SelectItem value="7s">7-a-side</SelectItem>
                      <SelectItem value="9s">9-a-side</SelectItem>
                      <SelectItem value="11s">11-a-side</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add other football-specific fields */}
          </>
        )

      case 'basketball':
        return (
          <>
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3v3">3v3</SelectItem>
                      <SelectItem value="5v5">5v5</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add other basketball-specific fields */}
          </>
        )

      // Add cases for other sports...

      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="sport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="volleyball">Volleyball</SelectItem>
                  <SelectItem value="cricket">Cricket</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tournament Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter tournament name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter tournament description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {renderSportSpecificFields()}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Tournament'}
        </Button>
      </form>
    </Form>
  )
} 