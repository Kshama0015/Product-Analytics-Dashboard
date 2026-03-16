import { useState } from "react"
import { toast } from "sonner"
import API from "../api/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function Login() {

  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    try {
      const res = await API.post("/login", { username, password })
      localStorage.setItem("token", res.data.token)
      toast.success("Login successful")
      window.location.reload()
    } catch (err) {
      toast.error("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const signup = async () => {
    setLoading(true)
    try {
      await API.post("/register", {
        username,
        password,
        age: age ? Number(age) : null,
        gender: gender || null
      })
      toast.success("Account created! Signing you in...")

      const res = await API.post("/login", { username, password })
      localStorage.setItem("token", res.data.token)
      window.location.reload()
    } catch (err) {
      const message = err.response?.data?.error || "Signup failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (isSignup) signup()
    else login()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSignup ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? "Sign up to start tracking analytics"
              : "Sign in to your analytics dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {isSignup && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            className="w-full mt-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? (isSignup ? "Creating account..." : "Signing in...")
              : (isSignup ? "Sign up" : "Sign in")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="underline text-foreground hover:text-primary"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
