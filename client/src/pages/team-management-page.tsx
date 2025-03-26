import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { Loader2, UserPlus, UserX, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Team {
  id: string
  name: string
  managerId: string
  members: TeamMember[]
}

interface TeamMember {
  id: string
  name: string
  position: string
  jerseyNumber?: number
  stats?: {
    goals?: number
    assists?: number
    yellowCards?: number
    redCards?: number
  }
}

export default function TeamManagementPage() {
  const [, params] = useLocation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isEditingMember, setIsEditingMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    position: '',
    jerseyNumber: undefined,
  })

  // Fetch team details
  const fetchTeam = async () => {
    try {
      const response = await apiRequest('GET', `/api/teams/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch team')
      const data = await response.json()
      setTeam(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch team',
        variant: 'destructive',
      })
    }
  }

  // Load data
  useState(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchTeam()
      setIsLoading(false)
    }
    loadData()
  }, [params.id])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!team) return

    try {
      const response = await apiRequest('POST', `/api/teams/${team.id}/members`, newMember)
      if (!response.ok) throw new Error('Failed to add team member')

      const updatedTeam = await response.json()
      setTeam(updatedTeam)
      setIsAddingMember(false)
      setNewMember({ name: '', position: '', jerseyNumber: undefined })

      toast({
        title: 'Success',
        description: 'Team member added successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add team member',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!team || !selectedMember) return

    try {
      const response = await apiRequest(
        'PUT',
        `/api/teams/${team.id}/members/${selectedMember.id}`,
        newMember
      )
      if (!response.ok) throw new Error('Failed to update team member')

      const updatedTeam = await response.json()
      setTeam(updatedTeam)
      setIsEditingMember(false)
      setSelectedMember(null)
      setNewMember({ name: '', position: '', jerseyNumber: undefined })

      toast({
        title: 'Success',
        description: 'Team member updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update team member',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return

    try {
      const response = await apiRequest('DELETE', `/api/teams/${team.id}/members/${memberId}`)
      if (!response.ok) throw new Error('Failed to remove team member')

      const updatedTeam = await response.json()
      setTeam(updatedTeam)

      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove team member',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Team Not Found</CardTitle>
            <CardDescription>The team you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isManager = user?.id === team.managerId

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>Team Management</CardDescription>
            </div>
            {isManager && (
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        required
                        placeholder="Enter member name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newMember.position}
                        onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                        required
                        placeholder="Enter position"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jerseyNumber">Jersey Number</Label>
                      <Input
                        id="jerseyNumber"
                        type="number"
                        value={newMember.jerseyNumber || ''}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            jerseyNumber: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="Enter jersey number"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit">Add Member</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {team.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.position}
                        {member.jerseyNumber && ` • #${member.jerseyNumber}`}
                      </p>
                    </div>
                    {isManager && (
                      <div className="flex gap-2">
                        <Dialog
                          open={isEditingMember && selectedMember?.id === member.id}
                          onOpenChange={(open) => {
                            setIsEditingMember(open)
                            if (open) {
                              setSelectedMember(member)
                              setNewMember({
                                name: member.name,
                                position: member.position,
                                jerseyNumber: member.jerseyNumber,
                              })
                            } else {
                              setSelectedMember(null)
                              setNewMember({ name: '', position: '', jerseyNumber: undefined })
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Team Member</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdateMember} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={newMember.name}
                                  onChange={(e) =>
                                    setNewMember({ ...newMember, name: e.target.value })
                                  }
                                  required
                                  placeholder="Enter member name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-position">Position</Label>
                                <Input
                                  id="edit-position"
                                  value={newMember.position}
                                  onChange={(e) =>
                                    setNewMember({ ...newMember, position: e.target.value })
                                  }
                                  required
                                  placeholder="Enter position"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-jerseyNumber">Jersey Number</Label>
                                <Input
                                  id="edit-jerseyNumber"
                                  type="number"
                                  value={newMember.jerseyNumber || ''}
                                  onChange={(e) =>
                                    setNewMember({
                                      ...newMember,
                                      jerseyNumber: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    })
                                  }
                                  placeholder="Enter jersey number"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <DialogClose asChild>
                                  <Button variant="outline" type="button">
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button type="submit">Update Member</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {member.stats && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Goals</p>
                        <p className="text-2xl font-bold">{member.stats.goals || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assists</p>
                        <p className="text-2xl font-bold">{member.stats.assists || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Yellow Cards</p>
                        <p className="text-2xl font-bold">{member.stats.yellowCards || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Red Cards</p>
                        <p className="text-2xl font-bold">{member.stats.redCards || 0}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 