import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useToast } from '../components/ui/use-toast'
import { supabase } from '../lib/supabase'
import { Tournament } from '../types/tournament'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'

interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
}

interface WatchedTournament {
  tournament_id: string
  tournament: Tournament
  last_watched: string
}

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [createdTournaments, setCreatedTournaments] = useState<Tournament[]>([])
  const [watchedTournaments, setWatchedTournaments] = useState<WatchedTournament[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError) throw profileError

      // Fetch created tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Fetch watched tournaments
      const { data: watchedData, error: watchedError } = await supabase
        .from('tournament_watches')
        .select(`
          tournament_id,
          last_watched,
          tournament:tournaments(*)
        `)
        .eq('user_id', user?.id)
        .order('last_watched', { ascending: false })

      if (watchedError) throw watchedError

      setProfile(profileData)
      setFormData({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
      })
      setCreatedTournaments(tournamentsData || [])
      setWatchedTournaments(watchedData || [])
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch profile data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
        })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      setIsEditing(false)
      fetchProfileData()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.full_name?.charAt(0) || profile.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.full_name || profile.username}</CardTitle>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Profile Details</TabsTrigger>
              <TabsTrigger value="created">Created Tournaments</TabsTrigger>
              <TabsTrigger value="watched">Watched Tournaments</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Full Name</h3>
                    <p className="text-muted-foreground">
                      {profile.full_name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Username</h3>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Role</h3>
                    <p className="text-muted-foreground capitalize">
                      {profile.role}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Member Since</h3>
                    <p className="text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="created" className="space-y-4">
              <div className="grid gap-4">
                {createdTournaments.map((tournament) => (
                  <Card key={tournament.id}>
                    <CardContent className="pt-6">
                      <h3 className="font-medium">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tournament.sport} •{' '}
                        {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Status: {tournament.status}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {createdTournaments.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No tournaments created yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="watched" className="space-y-4">
              <div className="grid gap-4">
                {watchedTournaments.map(({ tournament, last_watched }) => (
                  <Card key={tournament.id}>
                    <CardContent className="pt-6">
                      <h3 className="font-medium">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tournament.sport} •{' '}
                        {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Last watched:{' '}
                        {new Date(last_watched).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {watchedTournaments.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No tournaments watched yet
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 