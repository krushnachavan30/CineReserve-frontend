'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-white font-bold text-xl">MovieBook</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="/movies" className="text-gray-300 hover:text-white text-sm transition">
            Movies
          </Link>

          {user ? (
            <>
              <Link href="/orders" className="text-gray-300 hover:text-white text-sm transition">
                My Bookings
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-300 text-sm">{user.name}</span>
                <button
                  onClick={logout}
                  className="border border-gray-600 hover:border-red-500 text-gray-400 hover:text-red-400 px-4 py-1.5 rounded-lg text-sm transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-300 hover:text-white text-sm transition">
                Login
              </Link>
              <Link href="/register"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}