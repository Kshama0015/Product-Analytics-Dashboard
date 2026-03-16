import { useState } from "react"
import API from "../api/api"

export default function Login() {

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")

  const login = async () => {

    try{
      const res = await API.post("/login",{
        username,
        password
      })

      localStorage.setItem("token",res.data.token)
      alert("Login successful")
      window.location.reload()

    }catch(err){
      alert("Invalid credentials")
    }
  }

  return (
    <div>

      <input
        placeholder="username"
        onChange={(e)=>setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={login}>
        Login
      </button>

    </div>
  )
}