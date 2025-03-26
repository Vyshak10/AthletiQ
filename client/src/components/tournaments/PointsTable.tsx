import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

interface TeamStats {
  team_id: string
  team_name: string
  played: number
  won: number
  lost: number
  drawn: number
  goals_for: number
  goals_against: number
  points: number
  position: number
}

interface PointsTableProps {
  stats: TeamStats[]
}

export function PointsTable({ stats }: PointsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Pos</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">GF</TableHead>
            <TableHead className="text-center">GA</TableHead>
            <TableHead className="text-center">GD</TableHead>
            <TableHead className="text-center font-bold">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((team) => (
            <TableRow key={team.team_id}>
              <TableCell className="font-medium">{team.position}</TableCell>
              <TableCell>{team.team_name}</TableCell>
              <TableCell className="text-center">{team.played}</TableCell>
              <TableCell className="text-center text-green-600">{team.won}</TableCell>
              <TableCell className="text-center">{team.drawn}</TableCell>
              <TableCell className="text-center text-red-600">{team.lost}</TableCell>
              <TableCell className="text-center">{team.goals_for}</TableCell>
              <TableCell className="text-center">{team.goals_against}</TableCell>
              <TableCell className="text-center">
                {team.goals_for - team.goals_against}
              </TableCell>
              <TableCell className="text-center font-bold">{team.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 