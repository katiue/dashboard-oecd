"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  BarChartIcon as ChartColumn,
  Globe,
  MapPin,
  Trophy,
  Building2,
  FilterIcon as Funnel,
  X,
} from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { DynamicChart } from "./dynamic-chart"
import { Leaderboard } from "./leaderboard"
import { CountryDetailCard } from "./country-detail-card"

interface CountryData {
  rank: number
  flag: string
  name: string
  percentage: number
  value: number
  code: string
  region?: string
}

interface MarketShareData {
  name: string
  percentage: number
  value: string
  color: string
  width: number
  height: number
  x: number
  y: number
}

interface YearRange {
  start: number
  end: number
}

function countryCodeToFlag(code: string) {
  if (!code) return ""
  const map: Record<string, string> = {
    USA: "🇺🇸",
    DEU: "🇩🇪",
    JPN: "🇯🇵",
    CHN: "🇨🇳",
    KOR: "🇰🇷",
    FRA: "🇫🇷",
    GBR: "🇬🇧",
    ITA: "🇮🇹",
    NLD: "🇳🇱",
    CHE: "🇨🇭",
  }
  if (map[code]) return map[code]
  if (code.length === 2) {
    return code.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
  }
  return code
}

function getCountryRegion(code: string): string {
  const regions: Record<string, string> = {
    USA: "Americas",
    CAN: "Americas",
    MEX: "Americas",
    DEU: "Europe",
    FRA: "Europe",
    GBR: "Europe",
    ITA: "Europe",
    ESP: "Europe",
    NLD: "Europe",
    CHE: "Europe",
    JPN: "Asia",
    KOR: "Asia",
    CHN: "Asia",
    IND: "Asia",
    AUS: "Oceania",
    NZL: "Oceania",
    ZAF: "Africa",
  }
  return regions[code] || "Other"
}

export function OECDDashboard() {
  const [oecdCsv, setOecdCsv] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [yearRange, setYearRange] = useState<YearRange>({ start: 2016, end: 2021 })
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "area" | "treemap">("bar")

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockCsvData = `REF_AREA,TIME_PERIOD,MEASURE,UNIT_MEASURE,OBS_VALUE,Reference area
USA,2021,AP,PATN,39889,United States
DEU,2021,AP,PATN,22000,Germany
JPN,2021,AP,PATN,19000,Japan
CHN,2021,AP,PATN,18000,China (People's Republic of)
KOR,2021,AP,PATN,9000,Korea
FRA,2021,AP,PATN,8000,France
GBR,2021,AP,PATN,5000,United Kingdom
ITA,2021,AP,PATN,5000,Italy
NLD,2021,AP,PATN,4000,Netherlands
CHE,2021,AP,PATN,3000,Switzerland
USA,2020,AP,PATN,42000,United States
DEU,2020,AP,PATN,23000,Germany
JPN,2020,AP,PATN,20000,Japan
CHN,2020,AP,PATN,16000,China (People's Republic of)
KOR,2020,AP,PATN,8500,Korea
FRA,2020,AP,PATN,8200,France
GBR,2020,AP,PATN,5200,United Kingdom
ITA,2020,AP,PATN,4800,Italy
NLD,2020,AP,PATN,3800,Netherlands
CHE,2020,AP,PATN,2900,Switzerland
USA,2019,AP,PATN,45000,United States
DEU,2019,AP,PATN,24000,Germany
JPN,2019,AP,PATN,21000,Japan
CHN,2019,AP,PATN,14000,China (People's Republic of)
KOR,2019,AP,PATN,8000,Korea
USA,2018,AP,PATN,47000,United States
DEU,2018,AP,PATN,25000,Germany
JPN,2018,AP,PATN,22000,Japan
CHN,2018,AP,PATN,12000,China (People's Republic of)
USA,2017,AP,PATN,48000,United States
DEU,2017,AP,PATN,26000,Germany
JPN,2017,AP,PATN,23000,Japan
USA,2016,AP,PATN,46000,United States
DEU,2016,AP,PATN,25000,Germany
JPN,2016,AP,PATN,22000,Japan`
      setOecdCsv(mockCsvData)
      setLoading(false)
    }, 800)
  }, [])

  const { topCountries, totalPatents, activeCountries, yearlyData } = useMemo(() => {
    if (!oecdCsv) return { topCountries: [], totalPatents: 0, activeCountries: 0, yearlyData: [] }

    const lines = oecdCsv.split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) return { topCountries: [], totalPatents: 0, activeCountries: 0, yearlyData: [] }

    const headers = lines[0].split(",")
    const dataRows = lines.slice(1).map((line) => {
      const values = line.split(",")
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = values[i]
      })
      return row
    })

    const filteredByYearRange = dataRows.filter((row) => {
      const year = Number.parseInt(row["TIME_PERIOD"])
      return (
        year >= yearRange.start &&
        year <= yearRange.end &&
        row["MEASURE"] === "AP" &&
        row["UNIT_MEASURE"] === "PATN" &&
        row["REF_AREA"] &&
        row["OBS_VALUE"] &&
        row["REF_AREA"] !== "W"
      )
    })

    const countryTotals: Record<string, { code: string; name: string; value: number; region: string }> = {}

    filteredByYearRange.forEach((row) => {
      const code = row["REF_AREA"]
      const name = row["Reference area"] || row["REF_AREA"]
      const value = Number.parseFloat(row["OBS_VALUE"]) || 0
      const region = getCountryRegion(code)

      if (!countryTotals[code]) {
        countryTotals[code] = { code, name, value, region }
      } else {
        countryTotals[code].value += value
      }
    })

    const sorted = Object.values(countryTotals).sort((a, b) => b.value - a.value)

    const filteredByRegion =
      selectedFilter === "all" ? sorted : sorted.filter((country) => country.region?.toLowerCase() === selectedFilter)

    const top10 = filteredByRegion.slice(0, 10).map((row, i) => ({
      rank: i + 1,
      flag: countryCodeToFlag(row.code),
      name: row.name,
      code: row.code,
      value: Math.round(row.value),
      percentage: (row.value / (filteredByRegion[0]?.value || 1)) * 100,
      region: row.region,
    }))

    const yearlyData = []
    for (let year = yearRange.start; year <= yearRange.end; year++) {
      const yearData = dataRows.filter(
        (row) =>
          Number.parseInt(row["TIME_PERIOD"]) === year && row["MEASURE"] === "AP" && row["UNIT_MEASURE"] === "PATN",
      )

      const topCountriesForYear = yearData
        .map((row) => ({
          code: row["REF_AREA"],
          name: row["Reference area"] || row["REF_AREA"],
          value: Number.parseFloat(row["OBS_VALUE"]) || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      const yearEntry: Record<string, number> = { year }
      topCountriesForYear.forEach((country) => {
        yearEntry[country.name] = country.value
      })

      yearlyData.push(yearEntry)
    }

    return {
      topCountries: top10,
      totalPatents: Math.round(sorted.reduce((sum, country) => sum + country.value, 0)),
      activeCountries: sorted.length,
      yearlyData,
    }
  }, [oecdCsv, yearRange.start, yearRange.end, selectedFilter])

  const getCountryTrendData = (countryCode: string) => {
    if (!oecdCsv) return []

    const lines = oecdCsv.split(/\r?\n/).filter(Boolean)
    const headers = lines[0].split(",")
    const dataRows = lines.slice(1).map((line) => {
      const values = line.split(",")
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = values[i]
      })
      return row
    })

    const countryData = dataRows.filter(
      (row) => row["REF_AREA"] === countryCode && row["MEASURE"] === "AP" && row["UNIT_MEASURE"] === "PATN",
    )

    return countryData
      .map((row) => ({
        year: Number.parseInt(row["TIME_PERIOD"]),
        value: Number.parseFloat(row["OBS_VALUE"]) || 0,
      }))
      .sort((a, b) => a.year - b.year)
  }

  const handleYearRangeChange = (value: string) => {
    const [start, end] = value.split("-").map(Number)
    setYearRange({ start, end })
  }

  const handleCountryClick = (country: CountryData) => {
    setSelectedCountry(country)
  }

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value)
  }

  const handleChartTypeChange = (value: string) => {
    setChartType(value as "bar" | "line" | "pie" | "area" | "treemap")
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-mono">OECD Patents Dashboard</h1>
        <Badge className="justify-center inline-flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {yearRange.start} → {yearRange.end}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Patent Applications"
          value={loading ? "..." : totalPatents.toLocaleString()}
          icon={<ChartColumn className="h-5 w-5" />}
          color="rgb(38, 98, 217)"
        />
        <MetricCard
          title="Total Patent Families"
          value="275.577"
          icon={<Globe className="h-5 w-5" />}
          color="rgb(46, 184, 138)"
        />
        <MetricCard
          title="Active Countries"
          value={loading ? "..." : String(activeCountries)}
          icon={<MapPin className="h-5 w-5" />}
          color="rgb(232, 140, 48)"
        />
      </div>

      <Card className="w-full">
        <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div className="text-xl font-semibold">Top 10 Innovation Leaders</div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={`${yearRange.start}-${yearRange.end}`} onValueChange={handleYearRangeChange}>
                <SelectTrigger className="w-48 h-8">
                  <SelectValue>
                    Patents {yearRange.start}-{yearRange.end}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2016-2021">2016-2021 (All)</SelectItem>
                  <SelectItem value="2016-2018">2016-2018</SelectItem>
                  <SelectItem value="2019-2021">2019-2021</SelectItem>
                  <SelectItem value="2020-2021">2020-2021</SelectItem>
                  <SelectItem value="2016-2017">2016-2017</SelectItem>
                  <SelectItem value="2018-2019">2018-2019</SelectItem>
                  <SelectItem value="2020-2020">2020 Only</SelectItem>
                  <SelectItem value="2021-2021">2021 Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-32 h-8">
                  <Funnel className="h-3 w-3 mr-1" />
                  <SelectValue>{selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="americas">Americas</SelectItem>
                  <SelectItem value="oceania">Oceania</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <Leaderboard countries={topCountries} loading={loading} onCountryClick={handleCountryClick} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="text-lg font-semibold">
                  Patent Applications by Country ({yearRange.start}-{yearRange.end})
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{topCountries.length} countries</Badge>
                <Select value={chartType} onValueChange={handleChartTypeChange}>
                  <SelectTrigger className="w-32 h-8">
                    <ChartColumn className="h-3 w-3 mr-1" />
                    <SelectValue>{chartType.charAt(0).toUpperCase() + chartType.slice(1)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="treemap">Treemap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="w-full h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Loading chart...</div>
              ) : (
                <DynamicChart type={chartType} data={topCountries} yearlyData={yearlyData} yearRange={yearRange} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>By: Nguyen Vinh Khang</p>
      </div>

      <Dialog open={!!selectedCountry} onOpenChange={(open) => !open && setSelectedCountry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCountry && (
            <CountryDetailCard
              country={selectedCountry}
              yearRange={yearRange}
              trendData={getCountryTrendData(selectedCountry.code)}
              peerData={topCountries.filter((country) => country.region === selectedCountry.region).slice(0, 5)}
            />
          )}
          <DialogClose className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border-muted/40 max-h-28 p-0">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, white 0%, ${color} 100%)`,
        }}
      />
      <div className="p-4 relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="rounded-full flex-shrink-0 p-1">
              <div style={{ color }}>{icon}</div>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-muted-foreground leading-tight">{title}</h3>
            </div>
          </div>
        </div>
        <div>
          <p className="text-3xl font-medium tracking-tight" style={{ color }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}
