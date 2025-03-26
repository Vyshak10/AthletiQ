import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Search } from "lucide-react"

interface Tournament {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  status: string
  created_by: string
}

export default function TournamentsDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments")
      if (!response.ok) throw new Error("Failed to fetch tournaments")
      const data = await response.json()
      setTournaments(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tournaments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTournaments = tournaments.filter(tournament =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tournament.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        {user && (
          <Button onClick={() => navigate("/create-tournament")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Tournament
          </Button>
        )}
      </div>

      <div className="mb-8">
        <Input
          placeholder="Search tournaments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <Card
            key={tournament.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/tournaments/${tournament.id}`)}
          >
            <h3 className="text-xl font-semibold mb-2">{tournament.name}</h3>
            <p className="text-gray-600 mb-4">{tournament.description}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Start Date: {new Date(tournament.start_date).toLocaleDateString()}</p>
              <p>End Date: {new Date(tournament.end_date).toLocaleDateString()}</p>
              <p>Status: {tournament.status}</p>
            </div>
          </Card>
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No tournaments found</p>
        </div>
      )}
    </div>
  )
} 