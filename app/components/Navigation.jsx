'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return (
    <header className="shadow-md bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="navbar h-16 p-0">
          <div className="flex-1">
            <Link 
              href={user ? "/dashboard" : "/"} 
              className="btn btn-ghost text-xl font-bold normal-case"
            >
              ⚔️ Sword App
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal gap-2">
              {user ? (
                <>
                  <li>
                    <Link 
                      href="/dashboard"
                      className="btn btn-ghost btn-sm"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/new-blog"
                      className="btn btn-ghost btn-sm"
                    >
                      New Blog
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="btn btn-outline btn-sm"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href="/collection"
                      className="btn btn-ghost btn-sm"
                    >
                      Collection
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/explore"
                      className="btn btn-ghost btn-sm"
                    >
                      Explore
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/login"
                      className="btn btn-primary btn-sm"
                    >
                      Log in
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}