"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, Award, BarChart3, Flag, Globe2, Share2, Star, TrendingUp, Users } from "lucide-react"

// Add this import at the top
import { cn } from "@/lib/utils"

// Add this custom tooltip component before the CountryDetailCard component
const CustomTooltip = ({ active, payload, label, className }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cn(
          "bg-popover border border-border rounded-md shadow-md p-3 text-sm",
          "dark:bg-zinc-900 dark:border-zinc-800",
          className,
        )}
      >
        <p className="font-medium text-foreground mb-1">{`Year: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value.toLocaleString()} patents</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface CountryData {
  rank: number
  flag: string
  name: string
  percentage: number
  value: number
  code: string
  region?: string
}

interface YearRange {
  start: number
  end: number
}

interface CountryDetailCardProps {
  country: CountryData
  yearRange: YearRange
  trendData: Array<{ year: number; value: number }>
  peerData: CountryData[]
}

export function CountryDetailCard({ country, yearRange, trendData, peerData }: CountryDetailCardProps) {
  // Calculate growth rate
  const calculateGrowth = () => {
    if (trendData.length < 2) return 0
    const oldestValue = trendData[0].value
    const newestValue = trendData[trendData.length - 1].value
    return ((newestValue - oldestValue) / oldestValue) * 100
  }

  const growthRate = calculateGrowth()
  const growthIsPositive = growthRate >= 0

  // Get population data (mock data)
  const getPopulation = (code: string) => {
    const populations: Record<string, number> = {
      USA: 331.9,
      DEU: 83.2,
      JPN: 125.8,
      CHN: 1412.6,
      KOR: 51.7,
      FRA: 67.4,
      GBR: 67.2,
      ITA: 59.6,
      NLD: 17.4,
      CHE: 8.7,
    }
    return populations[code] || 50
  }

  const population = getPopulation(country.code)
  const patentsPerMillion = Math.round((country.value / population) * 100) / 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-4xl">
            {country.flag}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{country.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe2 className="h-3 w-3" />
                {country.region}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Rank #{country.rank}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Patents</div>
              <div className="text-2xl font-bold mt-1">{country.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {yearRange.start}-{yearRange.end} period
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Patents per Million</div>
              <div className="text-2xl font-bold mt-1">{patentsPerMillion.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Population: {population}M</div>
            </div>
            <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-full">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
              <div className="text-2xl font-bold mt-1 flex items-center">
                {growthIsPositive ? "+" : ""}
                {growthRate.toFixed(1)}%
                {growthIsPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600 ml-1 rotate-180" />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {yearRange.start} → {yearRange.end}
              </div>
            </div>
            <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="peers" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Regional Peers
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Patent Application Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb", r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                {country.name}'s patent applications {growthIsPositive ? "increased" : "decreased"} by{" "}
                <span className={growthIsPositive ? "text-green-600" : "text-red-600"}>
                  {Math.abs(growthRate).toFixed(1)}%
                </span>{" "}
                from {yearRange.start} to {yearRange.end}.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="peers" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Regional Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peerData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    label={{ position: "top", formatter: (value: any) => value.toLocaleString() }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                {country.name} ranks #{country.rank} among {country.region} countries in patent applications for the{" "}
                {yearRange.start}-{yearRange.end} period.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Key Insights</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {country.name} ranks <strong>#{country.rank}</strong> globally in patent applications
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Main filing authority: <strong>{country.code === "USA" ? "USPTO" : "EPO"}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {country.name} has <strong>{patentsPerMillion.toLocaleString()}</strong> patents per million
                    inhabitants
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {growthIsPositive ? "Positive" : "Negative"} growth trend of{" "}
                    <strong className={growthIsPositive ? "text-green-600" : "text-red-600"}>
                      {growthIsPositive ? "+" : ""}
                      {growthRate.toFixed(1)}%
                    </strong>{" "}
                    over the period
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Technology Focus</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Digital Communication</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "28%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Computer Technology</span>
                    <span className="font-medium">24%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Medical Technology</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "18%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pharmaceuticals</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Other Fields</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
