import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { SportType } from '../types/tournament'

interface TournamentFormData {
  name: string
  sport: SportType
  format: string
  start_date: string
  end_date: string
  description: string
}

const sportFormats: Record<SportType, string[]> = {
  football: ['6s', '7s', '9s', '11s'],
  basketball: ['3v3', '5v5'],
  volleyball: ['indoor', 'beach'],
  cricket: ['t20', 'one_day', 'test'],
  tennis: ['singles', 'doubles', 'mixed_doubles']
}

export function CreateTournament() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    sport: 'football',
    format: '11s',
    start_date: '',
    end_date: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user?.id) {
        throw new Error('Please sign in to create a tournament')
      }

      // Validate format based on sport
      const validFormats = sportFormats[formData.sport]
      if (!validFormats.includes(formData.format)) {
        throw new Error(`Invalid format for ${formData.sport}. Valid formats are: ${validFormats.join(', ')}`)
      }

      // Validate dates
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (startDate >= endDate) {
        throw new Error('End date must be after start date')
      }

      // Prepare the tournament data
      const tournamentData = {
        name: formData.name.trim(),
        sport: formData.sport,
        format: formData.format,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: 'draft' as const,
        created_by: user.id,
        description: formData.description.trim()
      }

      console.log('Creating tournament with data:', tournamentData)

      // Try to insert the tournament
      const { data, error } = await supabase
        .from('tournaments')
        .insert([tournamentData])
        .select('id')
        .single()

      if (error) {
        console.error('Error creating tournament:', error)
        
        // If it's a schema cache error, try to refresh the schema and retry
        if (error.code === 'PGRST204') {
          console.log('Schema cache error detected, waiting for refresh...')
          await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
          
          // Retry the insert
          const { data: retryData, error: retryError } = await supabase
            .from('tournaments')
            .insert([tournamentData])
            .select('id')
            .single()

          if (retryError) {
            throw new Error(retryError.message)
          }

          if (!retryData) {
            throw new Error('Failed to create tournament after retry')
          }

          console.log('Tournament created successfully after retry:', retryData)

          toast({
            title: 'Success',
            description: 'Tournament created successfully',
          })

          navigate(`/tournaments/${retryData.id}`)
          return
        }

        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Failed to create tournament')
      }

      console.log('Tournament created successfully:', data)

      toast({
        title: 'Success',
        description: 'Tournament created successfully',
      })

      navigate(`/tournaments/${data.id}`)
    } catch (error) {
      console.error('Error creating tournament:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create tournament',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSportChange = (sport: SportType) => {
    setFormData(prev => ({
      ...prev,
      sport,
      format: sportFormats[sport][0] // Set default format for the selected sport
    }))
  }

  const handleFormatChange = (format: string) => {
    setFormData(prev => ({
      ...prev,
      format
    }))
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter tournament name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Select 
                value={formData.sport}
                onValueChange={handleSportChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="volleyball">Volleyball</SelectItem>
                  <SelectItem value="cricket">Cricket</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select 
                value={formData.format}
                onValueChange={handleFormatChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {sportFormats[formData.sport].map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                min={formData.start_date || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter tournament description"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Tournament'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 