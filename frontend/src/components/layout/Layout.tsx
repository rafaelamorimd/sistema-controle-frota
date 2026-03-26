import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useMediaQuery } from '../../utils/useMediaQuery'

export default function Layout() {
  const [bolMenuAberto, setBolMenuAberto] = useState(false)
  const bolDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    if (bolDesktop) setBolMenuAberto(false)
  }, [bolDesktop])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        bolMobile={!bolDesktop}
        bolAberto={bolMenuAberto}
        onFechar={() => setBolMenuAberto(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onAbrirMenu={() => setBolMenuAberto(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
