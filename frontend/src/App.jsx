import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

function App() {

  const token = localStorage.getItem("token")

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {token ? <Dashboard/> : <Login/>}
      <Toaster />
    </ThemeProvider>
  )

}

export default App