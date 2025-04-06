import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/use-toast'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Link } from 'react-router-dom'
import { Loader2, Edit, Trash2 } from 'lucide-react'
import { Tournament } from '../types/tournament'

export function ManageTournaments() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const fetchTournaments = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setTournaments(data || [])
      } catch (error) {
        console.error('Error fetching tournaments:', error)
        toast({
          title: 'Error',
          description: 'Failed to load tournaments',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTournaments()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTournaments((prev) => prev.filter((t) => t.id !== id))
      toast({
        title: 'Success',
        description: 'Tournament deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete tournament',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500'
      case 'active':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Tournaments</CardTitle>
              <CardDescription>View and manage all tournaments</CardDescription>
            </div>
            <Button asChild>
              <Link to="/tournaments/create">Create Tournament</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tournaments found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell className="font-medium">
                        {tournament.name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {tournament.sport}
                      </TableCell>
                      <TableCell>
                        {new Date(tournament.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(tournament.status)}
                        >
                          {tournament.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                        >
                          <Link to={`/tournaments/${tournament.id}/manage`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(tournament.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 