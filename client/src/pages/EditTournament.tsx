import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../components/ui/use-toast'

interface TournamentFormData {
  name: string
  sport: string
  startDate: string
  endDate: string
  description: string
}

export function EditTournament() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    sport: '',
    startDate: '',
    endDate: '',
    description: ''
  })

  useEffect(() => {
    fetchTournament()
  }, [id])

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tournament')
      }

      const tournament = await response.json()
      if (tournament.createdBy !== user?.id) {
        toast({
          title: 'Error',
          description: 'You do not have permission to edit this tournament.',
          variant: 'destructive',
        })
        navigate('/tournaments')
        return
      }

      setFormData({
        name: tournament.name,
        sport: tournament.sport,
        startDate: tournament.startDate.split('T')[0],
        endDate: tournament.endDate.split('T')[0],
        description: tournament.description
      })
    } catch (error) {
      console.error('Error fetching tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament details.',
        variant: 'destructive',
      })
      navigate('/tournaments')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update tournament')
      }

      toast({
        title: 'Success',
        description: 'Tournament updated successfully!',
      })
      navigate(`/tournaments/${id}`)
    } catch (error) {
      console.error('Error updating tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to update tournament. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please log in to edit a tournament.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Select
                value={formData.sport}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/tournaments/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Tournament'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 