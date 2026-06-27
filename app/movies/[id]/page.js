'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import API from '../../../lib/axios'

export default function MovieDetail({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovieAndShows()
  }, [id])

  const fetchMovieAndShows = async () => {
    try {
      const [movieRes, showsRes] = await Promise.all([
        API.get(`/movies/${id}`),
        API.get(`/shows/movie/${id}`)
      ])
      setMovie(movieRes.data)
      setShows(showsRes.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  )

  if (!movie) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Movie not found</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Movie Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent z-10" />
        <div className="h-72 bg-gradient-to-r from-purple-900 to-red-900" />

        <div className="relative z-20 max-w-7xl mx-auto px-8 -mt-40">
          <div className="flex gap-8 items-end">

            {/* Poster */}
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-2xl border-2 border-gray-700 flex-shrink-0 shadow-2xl"
            />

            {/* Info */}
            <div className="pb-4">
              <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
              <div className="flex items-center gap-4 mb-3">
                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {movie.rating}/10
                </span>
                <span className="text-gray-400 text-sm">{movie.duration} min</span>
                <span className="text-gray-400 text-sm">{movie.language}</span>
              </div>
              <div className="flex gap-2 mb-4">
                {movie.genre.map(g => (
                  <span key={g} className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-1 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">{movie.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shows */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">🎭 Available Shows</h2>

        {shows.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <p className="text-4xl mb-3">😔</p>
            <p className="text-gray-300 text-lg">Abhi koi show available nahi hai</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {shows.map(show => (
              <div key={show._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between hover:border-red-500/30 transition">

                <div>
                  <h3 className="text-white font-semibold text-lg">{show.theatre?.name}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{show.theatre?.city} — {show.theatre?.address}</p>
                </div>

                <div className="text-center">
                  <p className="text-white font-bold text-xl">
                    {new Date(show.showTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(show.showTime).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Standard</p>
                  <p className="text-white font-bold text-lg">₹{show.price?.standard}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Available</p>
                  <p className="text-green-400 font-bold text-lg">
                    {show.totalSeats - (show.bookedSeats?.length || 0)}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/shows/${show._id}`)}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition"
                >
                  Select Seats
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}