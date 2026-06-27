'use client'

import { useState, useEffect, use, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import Navbar from '../../../components/Navbar'
import API from '../../../lib/axios'

function BookingContent({ showId }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const seats = searchParams.get('seats')?.split(',') || []

  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(600)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchShow()
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) {
      router.push(`/shows/${showId}`)
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  const fetchShow = async () => {
    try {
      const res = await API.get(`/shows/${showId}/seats`)
      setShow(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    setBooking(true)
    setError('')
    try {
      await API.post('/bookings', { showId, seats })
      router.push('/orders?success=true')
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed — dobara try karo')
    } finally {
      setBooking(false)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const totalAmount = seats.length * (show?.price?.standard || 0)

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

      <div className="max-w-2xl mx-auto px-8 py-10">

        {/* Timer */}
        <div className={`flex items-center justify-between mb-8 px-5 py-3 rounded-xl border ${
          timeLeft < 60
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱</span>
            <span className="text-gray-300 text-sm">Seats reserved for</span>
          </div>
          <span className={`font-bold text-xl font-mono ${
            timeLeft < 60 ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">Booking Summary</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 p-6 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎬</span>
              <h2 className="text-white font-bold text-xl">Pushpa 2</h2>
            </div>
            <p className="text-gray-400 text-sm">PVR Cinemas, Pune</p>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <span className="text-gray-400 text-sm">Selected Seats</span>
              <div className="flex gap-2 flex-wrap justify-end">
                {seats.map(seat => (
                  <span key={seat}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 text-sm px-3 py-1 rounded-full">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Number of Tickets</span>
              <span className="text-white font-medium">{seats.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Price per Ticket</span>
              <span className="text-white font-medium">₹{show?.price?.standard}</span>
            </div>

            <div className="border-t border-gray-800 pt-4 flex justify-between">
              <span className="text-white font-semibold text-lg">Total Amount</span>
              <span className="text-white font-bold text-2xl">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Booking for</p>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mt-4">
            {error}
          </div>
        )}

        <button
          onClick={handleBooking}
          disabled={booking || timeLeft <= 0}
          className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-lg transition disabled:opacity-50"
        >
          {booking ? 'Confirming...' : `Confirm Booking — ₹${totalAmount.toLocaleString('en-IN')}`}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full mt-3 border border-gray-700 text-gray-400 hover:text-white py-3 rounded-xl text-sm transition"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default function BookingPage({ params }) {
  const resolvedParams = use(params)
  const showId = resolvedParams.showId

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <BookingContent showId={showId} />
    </Suspense>
  )
}