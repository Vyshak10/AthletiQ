import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
      format: '11s',
      max_players_per_team: 11,
      min_players_per_team: 7,
      max_substitutes: 3,
      match_duration: 90,
      half_time_duration: 15,
      extra_time_duration: 30,
      penalty_shootout: true,
      offside_rule: true,
      throw_in_rule: true,
      corner_kick_rule: true,
      free_kick_rule: true,
    },
  })

  const sport = form.watch('sport')

  useEffect(() => {
    switch (sport) {
      case 'football':
        form.reset({
          ...form.getValues(),
          sport: 'football',
          format: '11s',
          max_players_per_team: 11,
          min_players_per_team: 7,
          max_substitutes: 3,
          match_duration: 90,
          half_time_duration: 15,
          extra_time_duration: 30,
          penalty_shootout: true,
          offside_rule: true,
          throw_in_rule: true,
          corner_kick_rule: true,
          free_kick_rule: true,
        })
        break
      case 'basketball':
        form.reset({
          ...form.getValues(),
          sport: 'basketball',
          format: '5v5',
          max_players_per_team: 5,
          min_players_per_team: 5,
          max_substitutes: 7,
          quarter_duration: 12,
          break_duration: 2,
          overtime_duration: 5,
          shot_clock: 24,
          three_point_line: true,
          free_throw_line: true,
        })
        break
      case 'volleyball':
        form.reset({
          ...form.getValues(),
          sport: 'volleyball',
          format: 'indoor',
          max_players_per_team: 6,
          min_players_per_team: 6,
          max_substitutes: 6,
          sets_to_win: 3,
          points_per_set: 25,
          points_to_win_set: 25,
          points_to_win_tiebreak: 15,
          libero_allowed: true,
          rotation_rule: true,
        })
        break
      case 'cricket':
        form.reset({
          ...form.getValues(),
          sport: 'cricket',
          format: 't20',
          max_players_per_team: 11,
          min_players_per_team: 11,
          max_substitutes: 4,
          overs_per_innings: 20,
          super_over: true,
          power_play: true,
          drs: true,
          no_ball_rule: true,
          wide_ball_rule: true,
        })
        break
    }
  }, [sport])

  const onSubmit = async (data: TournamentFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Extract base tournament data
      const { name, sport, format, start_date, end_date, description } = data;
      
      // Create sport-specific settings object based on the sport
      const sportSettings: any = {};
      
      if (sport === 'football') {
        sportSettings.max_players_per_team = data.max_players_per_team;
        sportSettings.min_players_per_team = data.min_players_per_team;
        sportSettings.max_substitutes = data.max_substitutes;
        sportSettings.match_duration = data.match_duration;
        sportSettings.half_time_duration = data.half_time_duration;
        sportSettings.extra_time_duration = data.extra_time_duration;
        sportSettings.penalty_shootout = data.penalty_shootout;
        sportSettings.offside_rule = data.offside_rule;
        sportSettings.throw_in_rule = data.throw_in_rule;
      } else if (sport === 'basketball') {
        sportSettings.max_players_per_team = data.max_players_per_team;
        sportSettings.min_players_per_team = data.min_players_per_team;
        sportSettings.max_substitutes = data.max_substitutes;
        sportSettings.quarter_duration = data.quarter_duration;
        sportSettings.break_duration = data.break_duration;
        sportSettings.overtime_duration = data.overtime_duration;
        sportSettings.shot_clock = data.shot_clock;
        sportSettings.three_point_line = data.three_point_line;
        sportSettings.free_throw_line = data.free_throw_line;
      } else if (sport === 'volleyball') {
        sportSettings.max_players_per_team = data.max_players_per_team;
        sportSettings.min_players_per_team = data.min_players_per_team;
        sportSettings.max_substitutes = data.max_substitutes;
        sportSettings.sets_to_win = data.sets_to_win;
        sportSettings.points_per_set = data.points_per_set;
        sportSettings.points_to_win_set = data.points_to_win_set;
        sportSettings.points_to_win_tiebreak = data.points_to_win_tiebreak;
        sportSettings.libero_allowed = data.libero_allowed;
        sportSettings.rotation_rule = data.rotation_rule;
      } else if (sport === 'cricket') {
        sportSettings.max_players_per_team = data.max_players_per_team;
        sportSettings.min_players_per_team = data.min_players_per_team;
        sportSettings.max_substitutes = data.max_substitutes;
        sportSettings.overs_per_innings = data.overs_per_innings;
        sportSettings.super_over = data.super_over;
        sportSettings.power_play = data.power_play;
        sportSettings.drs = data.drs;
        sportSettings.no_ball_rule = data.no_ball_rule;
        sportSettings.wide_ball_rule = data.wide_ball_rule;
      } else if (sport === 'tennis') {
        sportSettings.max_players_per_team = data.max_players_per_team;
        sportSettings.min_players_per_team = data.min_players_per_team;
        sportSettings.sets_to_win = data.sets_to_win;
        sportSettings.games_per_set = data.games_per_set;
        sportSettings.tiebreak_at = data.tiebreak_at;
        sportSettings.super_tiebreak = data.super_tiebreak;
        sportSettings.let_rule = data.let_rule;
        sportSettings.advantage_rule = data.advantage_rule;
      }

      const { error } = await supabase.from('tournaments').insert([
        {
          name,
          sport,
          format,
          start_date,
          end_date,
          description,
          created_by: user.id,
          status: 'draft',
          sport_settings: sportSettings
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
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="max_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={6} max={11} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={6} max={11} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_substitutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Substitutes</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="match_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={30} max={120} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="half_time_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Half-time Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} max={15} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extra_time_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra Time Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} max={30} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="penalty_shootout"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Penalty Shootout</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offside_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Offside Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="throw_in_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Throw-in Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="corner_kick_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Corner Kick Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="free_kick_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Kick Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'basketball':
        return (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="max_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={3} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={3} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_substitutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Substitutes</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={7} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quarter_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarter Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} max={12} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="break_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overtime_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overtime Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={3} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shot_clock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shot Clock (seconds)</FormLabel>
                    <FormControl>
                      <Input type="number" min={14} max={30} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="three_point_line"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Three Point Line</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="free_throw_line"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Throw Line</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'volleyball':
        return (
          <div className="space-y-6">
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
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="beach">Beach</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="max_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={6} max={6} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={6} max={6} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_substitutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Substitutes</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={6} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sets_to_win"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sets to Win</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points_per_set"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points per Set</FormLabel>
                    <FormControl>
                      <Input type="number" min={15} max={25} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points_to_win_set"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points to Win Set</FormLabel>
                    <FormControl>
                      <Input type="number" min={15} max={25} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points_to_win_tiebreak"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points to Win Tiebreak</FormLabel>
                    <FormControl>
                      <Input type="number" min={15} max={15} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="libero_allowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Libero Allowed</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rotation_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Rotation Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'cricket':
        return (
          <div className="space-y-6">
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
                      <SelectItem value="t20">T20</SelectItem>
                      <SelectItem value="one_day">One Day</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="max_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={11} max={11} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={11} max={11} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_substitutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Substitutes</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={4} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overs_per_innings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overs per Innings</FormLabel>
                    <FormControl>
                      <Input type="number" min={20} max={50} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="super_over"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Super Over</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="power_play"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Power Play</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">DRS</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="no_ball_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">No Ball Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wide_ball_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Wide Ball Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'tennis':
        return (
          <div className="space-y-6">
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
                      <SelectItem value="singles">Singles</SelectItem>
                      <SelectItem value="doubles">Doubles</SelectItem>
                      <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="max_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={2} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_players_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Players per Team</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={2} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sets_to_win"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sets to Win</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="games_per_set"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Games per Set</FormLabel>
                    <FormControl>
                      <Input type="number" min={6} max={6} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiebreak_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiebreak at Games</FormLabel>
                    <FormControl>
                      <Input type="number" min={6} max={6} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="super_tiebreak"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Super Tiebreak</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="let_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Let Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advantage_rule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Advantage Rule</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter tournament description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {renderSportSpecificFields()}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Tournament'}
        </Button>
      </form>
    </Form>
  )
} 