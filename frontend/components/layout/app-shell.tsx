import { TopNav } from "./top-nav"
import { SideNav } from "./side-nav"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <TopNav />
      <div className="flex">
        <SideNav />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
