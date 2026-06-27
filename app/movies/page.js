'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import API from '../../lib/axios'

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer) // cleanup — naya type kiya toh timer reset
  }, [value, delay])

  return debouncedValue
}

export default function Movies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [genre, setGenre] = useState('')
  const [search, setSearch] = useState('')

  // Debounced search — 500ms baad API call
  const debouncedSearch = useDebounce(search, 500)

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi']

  // Jab bhi genre ya debouncedSearch change ho — fetch karo
  useEffect(() => {
    fetchMovies()
  }, [genre, debouncedSearch])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const params = {}
      if (genre && genre !== 'All') params.genre = genre
      if (debouncedSearch) params.search = debouncedSearch
      const res = await API.get('/movies', { params })
      setMovies(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-900/50 to-purple-900/50 border-b border-gray-800 px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-2">🎬 Now Showing</h1>
          <p className="text-gray-400 mb-6">Apni favourite movie ke tickets book karo</p>

          {/* Search Box */}
          <div className="relative max-w-hi">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Movie search karo..."
              className="w-full bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-5 py-3 text-sm outline-none focus:border-red-500 transition pr-10"
            />
            {/* Search icon */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              🔍
            </span>
            {/* Loading indicator jab search ho raha ho */}
            {search !== debouncedSearch && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                ...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Genre Filter */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g === 'All' ? '' : g)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                (g === 'All' && !genre) || genre === g
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search result info */}
        {debouncedSearch && (
          <p className="text-gray-400 text-sm mb-4">
            "{debouncedSearch}" ke liye {movies.length} results
          </p>
        )}

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-lg">Loading movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎭</p>
            <p className="text-gray-300 text-xl">Koi movie nahi mili</p>
            {debouncedSearch && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-red-400 text-sm hover:text-red-300"
              >
                Search clear karo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map(movie => (
              <Link href={`/movies/${movie._id}`} key={movie._id}>
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-500/50 hover:scale-105 transition duration-300 cursor-pointer group">

                  {/* Poster */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">
                      ⭐ {movie.rating}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-xs">{movie.language}</span>
                      <span className="text-gray-600 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{movie.duration} min</span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {movie.genre.slice(0, 2).map(g => (
                        <span key={g} className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                          {g}
                        </span>
                      ))}
                    </div>
                    <button className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition">
                      Book Tickets
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}