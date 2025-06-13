import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Trophy, Medal } from 'lucide-react'

interface CountryData {
  rank: number
  flag: string
  name: string
  percentage: number
  value: number
  code: string
  region?: string
}

interface LeaderboardProps {
  countries: CountryData[]
  loading: boolean
  onCountryClick: (country: CountryData) => void
}

export function Leaderboard({ countries, loading, onCountryClick }: LeaderboardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">Loading leaderboard data...</div>
        </div>
      </div>
    )
  }

  // No data state
  if (!countries || countries.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="text-xl font-medium">No data available</div>
          <div className="text-muted-foreground">Try changing your filters</div>
        </div>
      </div>
    )
  }

  // Get top 3 for podium
  const topThree = countries.slice(0, 3)
  // Get the rest for the list
  const restOfList = countries.slice(3)

  return (
    <div className="space-y-8">
      {/* Podium for top 3 */}
      <div className="flex items-end justify-center gap-4 h-64 mb-8">
        {/* Second Place */}
        <div
          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
          onClick={() => topThree[1] && onCountryClick(topThree[1])}
        >
          <div className="text-4xl mb-2">{topThree[1]?.flag}</div>
          <div className="font-semibold text-sm truncate max-w-32 text-center">{topThree[1]?.name}</div>
          <div className="text-2xl font-bold text-[#C0C0C0]">2</div>
          <div className="text-sm font-medium">{topThree[1]?.value.toLocaleString()}</div>
          <div className="bg-[#C0C0C0] h-32 w-24 rounded-t-lg flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* First Place - Taller */}
        <div
          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
          onClick={() => topThree[0] && onCountryClick(topThree[0])}
        >
          <div className="text-5xl mb-2">{topThree[0]?.flag}</div>
          <div className="font-semibold truncate max-w-32 text-center">{topThree[0]?.name}</div>
          <div className="text-3xl font-bold text-[#FFD700]">1</div>
          <div className="text-lg font-medium">{topThree[0]?.value.toLocaleString()}</div>
          <div className="bg-[#FFD700] h-40 w-28 rounded-t-lg flex items-center justify-center">
            <Trophy className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Third Place */}
        <div
          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
          onClick={() => topThree[2] && onCountryClick(topThree[2])}
        >
          <div className="text-4xl mb-2">{topThree[2]?.flag}</div>
          <div className="font-semibold text-sm truncate max-w-32 text-center">{topThree[2]?.name}</div>
          <div className="text-2xl font-bold text-[#CD7F32]">3</div>
          <div className="text-sm font-medium">{topThree[2]?.value.toLocaleString()}</div>
          <div className="bg-[#CD7F32] h-24 w-24 rounded-t-lg flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Rest of the leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {restOfList.map((country) => (
          <Card
            key={country.code}
            className="flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onCountryClick(country)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                {country.rank}
              </div>
              <div className="text-3xl">{country.flag}</div>
              <div>
                <div className="font-medium">{country.name}</div>
                <Badge variant="outline" className="mt-1">
                  {country.region}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-bold text-lg">{country.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">patents</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
