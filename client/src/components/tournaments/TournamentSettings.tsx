import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../ui/use-toast'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface TournamentSettingsProps {
  tournamentId: string
  sport: string
  isHost: boolean
}

export function TournamentSettings({ tournamentId, sport, isHost }: TournamentSettingsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [tournamentId])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('sport_settings')
        .eq('id', tournamentId)
        .single()

      if (error) throw error
      setSettings(data.sport_settings)
    } catch (error) {
      console.error('Error fetching tournament settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tournament settings',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ sport_settings: settings })
        .eq('id', tournamentId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Tournament settings updated successfully',
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating tournament settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update tournament settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const renderSettingField = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center justify-between space-x-2" key={key}>
          <Label htmlFor={key}>{key.split('_').join(' ').toUpperCase()}</Label>
          <Switch
            id={key}
            checked={value}
            onCheckedChange={(checked) => handleChange(key, checked)}
            disabled={!isEditing}
          />
        </div>
      )
    }

    return (
      <div className="space-y-2" key={key}>
        <Label htmlFor={key}>{key.split('_').join(' ').toUpperCase()}</Label>
        <Input
          id={key}
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleChange(key, e.target.type === 'number' ? parseInt(e.target.value) : e.target.value)}
          disabled={!isEditing}
        />
      </div>
    )
  }

  if (!settings) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tournament Settings</CardTitle>
        {isHost && (
          <div className="space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    fetchSettings()
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(settings).map(([key, value]) => renderSettingField(key, value))}
      </CardContent>
    </Card>
  )
} 