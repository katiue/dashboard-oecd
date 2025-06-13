"use client"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Treemap,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList,
} from "recharts"

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

interface DynamicChartProps {
  type: "bar" | "line" | "pie" | "area" | "treemap"
  data: CountryData[]
  yearlyData: any[]
  yearRange: YearRange
}

// Generate a color based on index
const getColor = (index: number) => {
  const colors = [
    "#2662D9", // Blue
    "#2EB88A", // Green
    "#E88C30", // Orange
    "#D33F49", // Red
    "#8A4FFF", // Purple
    "#26C6DA", // Cyan
    "#FFB74D", // Amber
    "#9CCC65", // Light Green
    "#FF8A65", // Deep Orange
    "#BA68C8", // Purple
  ]
  return colors[index % colors.length]
}

export function DynamicChart({ type, data, yearlyData, yearRange }: DynamicChartProps) {
  // Prepare data for charts
  const chartData = data.map((country) => ({
    name: country.name,
    value: country.value,
    flag: country.flag,
    percentage: country.percentage,
  }))

  // For line and area charts, we need data over time
  const timeSeriesData = yearlyData

  switch (type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} interval={0} />
            <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} patents`, "Patents"]}
              labelFormatter={(label) => `Country: ${label}`}
            />
            <Legend />
            <Bar dataKey="value" name="Patents" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index)} />
              ))}
              <LabelList dataKey="flag" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )

    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timeSeriesData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} patents`, ""]} />
            <Legend />
            {Object.keys(timeSeriesData[0] || {})
              .filter((key) => key !== "year")
              .slice(0, 5)
              .map((country, index) => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  stroke={getColor(index)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={country}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      )

    case "pie":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, flag, percentage }) => `${flag} ${name} (${percentage.toFixed(1)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index)} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} patents`, "Patents"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )

    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={timeSeriesData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} patents`, ""]} />
            <Legend />
            {Object.keys(timeSeriesData[0] || {})
              .filter((key) => key !== "year")
              .slice(0, 5)
              .map((country, index) => (
                <Area
                  key={country}
                  type="monotone"
                  dataKey={country}
                  stackId="1"
                  stroke={getColor(index)}
                  fill={getColor(index)}
                  name={country}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      )

    case "treemap": {
      // Transform data for treemap
      const treemapData = chartData.map((item) => ({
        name: `${item.flag} ${item.name}`,
        size: item.value,
      }))

      return (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} patents`, "Patents"]}
              labelFormatter={(label) => `Country: ${label}`}
            />
          </Treemap>
        </ResponsiveContainer>
      )
    }

    default:
      return <div>Chart type not supported</div>
  }
}
