'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import API from '../../lib/axios'

export default function Admin() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Movie form
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', genre: [], duration: '',
    language: 'Hindi', releaseDate: '', poster: '', rating: ''
  })

  // Theatre form
  const [theatreForm, setTheatreForm] = useState({
    name: '', city: '', address: '', totalSeats: '', rows: '', seatsPerRow: ''
  })

  // Show form
  const [showForm, setShowForm] = useState({
    movieId: '', theatreId: '', showTime: '',
    price: { standard: '', premium: '' }
  })

  const [movies, setMovies] = useState([])
  const [theatres, setTheatres] = useState([])
  const [formMessage, setFormMessage] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi']

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'admin') { router.push('/movies'); return }
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    try {
      const [statsRes, bookingsRes, moviesRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/bookings'),
        API.get('/movies')
      ])
      setStats(statsRes.data)
      setBookings(bookingsRes.data)
      setMovies(moviesRes.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenreToggle = (g) => {
    setMovieForm(prev => ({
      ...prev,
      genre: prev.genre.includes(g)
        ? prev.genre.filter(x => x !== g)
        : [...prev.genre, g]
    }))
  }

  const handleCreateMovie = async () => {
    setFormLoading(true)
    setFormMessage('')
    try {
      await API.post('/admin/movies', movieForm)
      setFormMessage('✅ Movie created successfully!')
      setMovieForm({
        title: '', description: '', genre: [], duration: '',
        language: 'Hindi', releaseDate: '', poster: '', rating: ''
      })
      fetchAll()
    } catch (err) {
      setFormMessage('❌ ' + (err.response?.data?.message || 'Error hua'))
    } finally {
      setFormLoading(false)
    }
  }

  const handleCreateTheatre = async () => {
    setFormLoading(true)
    setFormMessage('')
    try {
      const res = await API.post('/admin/theatres', theatreForm)
      setTheatres([...theatres, res.data.theatre])
      setFormMessage('✅ Theatre created successfully!')
      setTheatreForm({ name: '', city: '', address: '', totalSeats: '', rows: '', seatsPerRow: '' })
    } catch (err) {
      setFormMessage('❌ ' + (err.response?.data?.message || 'Error hua'))
    } finally {
      setFormLoading(false)
    }
  }

  const handleCreateShow = async () => {
    setFormLoading(true)
    setFormMessage('')
    try {
      await API.post('/admin/shows', showForm)
      setFormMessage('✅ Show created successfully!')
      setShowForm({ movieId: '', theatreId: '', showTime: '', price: { standard: '', premium: '' } })
    } catch (err) {
      setFormMessage('❌ ' + (err.response?.data?.message || 'Error hua'))
    } finally {
      setFormLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">⚙️ Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { key: 'dashboard', label: '📊 Dashboard' },
            { key: 'add-movie', label: '🎬 Add Movie' },
            { key: 'add-theatre', label: '🏛️ Add Theatre' },
            { key: 'add-show', label: '🎭 Add Show' },
            { key: 'bookings', label: '🎟️ Bookings' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setFormMessage('') }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Movies', value: stats.totalMovies, icon: '🎬', color: 'text-blue-400' },
              { label: 'Total Bookings', value: stats.totalBookings, icon: '🎟️', color: 'text-green-400' },
              { label: 'Total Theatres', value: stats.totalTheatres, icon: '🏛️', color: 'text-purple-400' },
              { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'text-yellow-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-3xl mb-3">{stat.icon}</div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className={`font-bold text-2xl ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Movie */}
        {activeTab === 'add-movie' && (
          <div className="max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-white font-semibold text-xl mb-6">Add New Movie</h2>
            {formMessage && (
              <div className={`px-4 py-3 rounded-xl text-sm mb-5 ${
                formMessage.includes('✅')
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>{formMessage}</div>
            )}
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Movie Title" value={movieForm.title}
                onChange={e => setMovieForm({...movieForm, title: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />

              <textarea placeholder="Description" value={movieForm.description} rows={3}
                onChange={e => setMovieForm({...movieForm, description: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition resize-none" />

              <div>
                <p className="text-gray-400 text-sm mb-2">Genre</p>
                <div className="flex gap-2 flex-wrap">
                  {genres.map(g => (
                    <button key={g} onClick={() => handleGenreToggle(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        movieForm.genre.includes(g)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Duration (mins)" value={movieForm.duration}
                  onChange={e => setMovieForm({...movieForm, duration: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
                <input type="number" placeholder="Rating (0-10)" value={movieForm.rating}
                  onChange={e => setMovieForm({...movieForm, rating: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Language" value={movieForm.language}
                  onChange={e => setMovieForm({...movieForm, language: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
                <input type="date" value={movieForm.releaseDate}
                  onChange={e => setMovieForm({...movieForm, releaseDate: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
              </div>

              <input type="text" placeholder="Poster URL" value={movieForm.poster}
                onChange={e => setMovieForm({...movieForm, poster: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />

              <button onClick={handleCreateMovie} disabled={formLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50">
                {formLoading ? 'Creating...' : '+ Add Movie'}
              </button>
            </div>
          </div>
        )}

        {/* Add Theatre */}
        {activeTab === 'add-theatre' && (
          <div className="max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-white font-semibold text-xl mb-6">Add New Theatre</h2>
            {formMessage && (
              <div className={`px-4 py-3 rounded-xl text-sm mb-5 ${
                formMessage.includes('✅')
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>{formMessage}</div>
            )}
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Theatre Name" value={theatreForm.name}
                onChange={e => setTheatreForm({...theatreForm, name: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="City" value={theatreForm.city}
                  onChange={e => setTheatreForm({...theatreForm, city: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
                <input type="text" placeholder="Address" value={theatreForm.address}
                  onChange={e => setTheatreForm({...theatreForm, address: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" placeholder="Total Seats" value={theatreForm.totalSeats}
                  onChange={e => setTheatreForm({...theatreForm, totalSeats: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
                <input type="number" placeholder="Rows" value={theatreForm.rows}
                  onChange={e => setTheatreForm({...theatreForm, rows: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
                <input type="number" placeholder="Seats/Row" value={theatreForm.seatsPerRow}
                  onChange={e => setTheatreForm({...theatreForm, seatsPerRow: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
              </div>
              <button onClick={handleCreateTheatre} disabled={formLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50">
                {formLoading ? 'Creating...' : '+ Add Theatre'}
              </button>
            </div>
          </div>
        )}

        {/* Add Show */}
        {activeTab === 'add-show' && (
          <div className="max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-white font-semibold text-xl mb-6">Add New Show</h2>
            {formMessage && (
              <div className={`px-4 py-3 rounded-xl text-sm mb-5 ${
                formMessage.includes('✅')
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>{formMessage}</div>
            )}
            <div className="flex flex-col gap-4">
              <select value={showForm.movieId}
                onChange={e => setShowForm({...showForm, movieId: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition">
                <option value="">Select Movie</option>
                {movies.map(m => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>

              <input type="text" placeholder="Theatre ID" value={showForm.theatreId}
                onChange={e => setShowForm({...showForm, theatreId: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />

              <input type="datetime-local" value={showForm.showTime}
                onChange={e => setShowForm({...showForm, showTime: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Standard Price" value={showForm.price.standard}
                  onChange={e => setShowForm({...showForm, price: {...showForm.price, standard: e.target.value}})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
                <input type="number" placeholder="Premium Price" value={showForm.price.premium}
                  onChange={e => setShowForm({...showForm, price: {...showForm.price, premium: e.target.value}})}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition" />
              </div>

              <button onClick={handleCreateShow} disabled={formLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50">
                {formLoading ? 'Creating...' : '+ Add Show'}
              </button>
            </div>
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-400 text-sm">Total: {bookings.length} bookings</p>
            {bookings.map(booking => (
              <div key={booking._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{booking.movieTitle}</p>
                  <p className="text-gray-400 text-sm">{booking.user?.name} — {booking.user?.email}</p>
                  <div className="flex gap-2 mt-2">
                    {booking.seats.map(s => (
                      <span key={s} className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    booking.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}