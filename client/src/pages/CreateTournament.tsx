import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CreateTournamentForm } from '../components/tournaments/CreateTournamentForm'

export function CreateTournament() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTournamentForm />
        </CardContent>
      </Card>
    </div>
  )
} 