import { useEffect, useState } from "react"
import API from "../api/api"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

export default function Dashboard() {

  const [data, setData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [selectedFeature, setSelectedFeature] = useState(null)

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  )
  const [endDate, setEndDate] = useState(new Date())

  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")

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
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          age,
          gender
        }
      })

      const formatted = Object.entries(res.data).map(([feature, clicks]) => ({
        feature,
        clicks
      }))

      setData(formatted)

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
    fetchAnalytics()
  }, [startDate, endDate, age, gender])

  return (

    <div style={{ padding: "40px", maxWidth: "1100px", margin: "auto" }}>

      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        Product Analytics Dashboard
      </h1>

      {/* FILTERS */}

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "40px",
          alignItems: "center"
        }}
      >

        {/* DATE FILTER */}

        <div>
          <label>Date Range</label>
          <br />

          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date)
              trackEvent("date_filter")
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />

          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date)
              trackEvent("date_filter")
            }}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>

        {/* AGE FILTER */}

        <div>
          <label>Age</label>
          <br />

          <select
            value={age}
            onChange={(e) => {
              setAge(e.target.value)
              trackEvent("age_filter")
            }}
          >
            <option value="">All</option>
            <option value="<18">{"<18"}</option>
            <option value="18-40">18-40</option>
            <option value=">40">{">40"}</option>
          </select>
        </div>

        {/* GENDER FILTER */}

        <div>
          <label>Gender</label>
          <br />

          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value)
              trackEvent("gender_filter")
            }}
          >
            <option value="">All</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>

      </div>

      {/* BAR CHART */}

      <div style={{ height: "400px" }}>

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="feature" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="clicks"
              fill="#4f46e5"
              cursor="pointer"
              onClick={(entry) => {
                fetchDailyAnalytics(entry.feature)
                trackEvent("bar_click")
              }}
              onMouseEnter={() => trackEvent("chart_hover")}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* LINE CHART */}

      {selectedFeature && (

        <div style={{ height: "350px", marginTop: "50px" }}>

          <h2 style={{ marginBottom: "20px" }}>
            Daily Clicks — {selectedFeature}
          </h2>

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={dailyData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#16a34a"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  )
}