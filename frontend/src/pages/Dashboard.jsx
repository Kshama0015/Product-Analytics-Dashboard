import { useEffect, useMemo, useState } from "react"
import Cookies from "js-cookie"
import API from "../api/api"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts"

export default function Dashboard() {

  const [data, setData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [selectedFeature, setSelectedFeature] = useState(null)

  const [dateRange, setDateRange] = useState(() => {
    const savedFrom = Cookies.get("filter_date_from")
    const savedTo = Cookies.get("filter_date_to")
    return {
      from: savedFrom ? new Date(savedFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: savedTo ? new Date(savedTo) : new Date()
    }
  })

  const [age, setAge] = useState(() => Cookies.get("filter_age") || "")
  const [gender, setGender] = useState(() => Cookies.get("filter_gender") || "")

  // -------- SAVE FILTERS TO COOKIES --------

  useEffect(() => {
    if (dateRange?.from) Cookies.set("filter_date_from", dateRange.from.toISOString(), { expires: 30 })
    if (dateRange?.to) Cookies.set("filter_date_to", dateRange.to.toISOString(), { expires: 30 })
    Cookies.set("filter_age", age, { expires: 30 })
    Cookies.set("filter_gender", gender, { expires: 30 })
  }, [dateRange, age, gender])

  // -------- TRACK EVENTS --------

  const trackEvent = async (eventName) => {
    try {
      await API.post("/track", {
        feature_name: eventName
      })
    } catch (err) {
      console.error("Tracking failed", err)
    }
  }

  // -------- BAR CHART DATA --------

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics", {
        params: {
          start_date: dateRange?.from?.toISOString(),
          end_date: dateRange?.to?.toISOString(),
          age,
          gender
        }
      })

      const formatted = Object.entries(res.data).map(([feature, clicks]) => ({
        feature,
        clicks
      }))

      setData(formatted)

      if (formatted.length > 0) {
        const first = formatted[0].feature
        fetchDailyAnalytics(first)
      }
    } catch (err) {
      console.error("Analytics fetch failed", err)
    }
  }

  // -------- LINE CHART DATA --------

  const fetchDailyAnalytics = async (feature) => {
    try {
      const res = await API.get("/analytics/daily", {
        params: { feature }
      })

      setDailyData(res.data)
      setSelectedFeature(feature)
    } catch (err) {
      console.error("Daily analytics fetch failed", err)
    }
  }

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchAnalytics()
    }
  }, [dateRange, age, gender])

  const totalClicks = useMemo(
    () => data.reduce((acc, curr) => acc + curr.clicks, 0),
    [data]
  )

  const barChartConfig = {
    clicks: {
      label: "Clicks",
      color: "var(--chart-1)",
    },
  }

  const lineChartConfig = {
    clicks: {
      label: "Clicks",
      color: "var(--chart-2)",
    },
  }

  return (

    <div className="p-6 md:p-10 max-w-[1100px] mx-auto">

      <h1 className="text-xl font-semibold mb-6">
        Product Analytics Dashboard
      </h1>

      {/* FILTERS */}

      <div className="flex gap-6 mb-8 items-end flex-wrap">

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Date Range</label>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              setDateRange(range)
              trackEvent("date_filter")
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Age</label>
          <Select
            value={age}
            onValueChange={(value) => {
              setAge(value === "all" ? "" : value)
              trackEvent("age_filter")
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="<18">{"<18"}</SelectItem>
              <SelectItem value="18-40">18-40</SelectItem>
              <SelectItem value=">40">{">40"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Gender</label>
          <Select
            value={gender}
            onValueChange={(value) => {
              setGender(value === "all" ? "" : value)
              trackEvent("gender_filter")
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
              <SelectItem value="O">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto self-end flex gap-2">
          <ModeToggle />
          <AlertDialog>
            <AlertDialogTrigger
              className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Logout</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your filter preferences will be cleared.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    localStorage.removeItem("token")
                    Cookies.remove("filter_date_from")
                    Cookies.remove("filter_date_to")
                    Cookies.remove("filter_age")
                    Cookies.remove("filter_gender")
                    window.location.reload()
                  }}
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 gap-6">

        {/* BAR CHART — Feature Usage */}

        <Card className="py-0">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Total Clicks</CardTitle>
            <CardDescription>
              Click a bar to see daily trend
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer
              config={barChartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                margin={{ left: 20, right: 12 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={100}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideIndicator />}
                  cursor={false}
                />
                <Bar
                  dataKey="clicks"
                  fill="var(--color-clicks)"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(entry) => {
                    fetchDailyAnalytics(entry.feature)
                    trackEvent("bar_click")
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* LINE CHART — Daily Clicks */}

        <Card className="py-0">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>
              {selectedFeature ? `Clicks Daily — ${selectedFeature}` : "Clicks Daily"}
            </CardTitle>
            <CardDescription>
              {selectedFeature
                ? "Daily click trend for the selected feature"
                : "Select a feature from the bar chart"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            {selectedFeature ? (
              <ChartContainer
                config={lineChartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={dailyData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[150px]"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Click a bar to view daily clicks
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}