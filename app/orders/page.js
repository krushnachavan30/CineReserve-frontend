'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import API from '../../lib/axios'
import { Suspense } from 'react'

function OrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const success = searchParams.get('success')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my-bookings')
      setBookings(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!confirm('Booking cancel karna chahte ho?')) return
    try {
      await API.put(`/bookings/cancel/${bookingId}`)
      setBookings(bookings.map(b =>
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
    } catch (err) {
      console.log(err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold">Booking Confirmed!</p>
              <p className="text-sm text-green-500/70">Tumhari tickets book ho gayi hain</p>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
            <p className="text-5xl mb-4">🎬</p>
            <p className="text-gray-300 text-xl font-medium">Koi booking nahi hai</p>
            <p className="text-gray-500 text-sm mt-2 mb-6">Abhi movies dekho aur tickets book karo!</p>
            <button
              onClick={() => router.push('/movies')}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-medium transition"
            >
              Movies Dekho
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {bookings.map(booking => (
              <div key={booking._id}
                className={`bg-gray-900 border rounded-2xl overflow-hidden transition ${
                  booking.status === 'cancelled'
                    ? 'border-gray-800 opacity-60'
                    : 'border-gray-800 hover:border-gray-700'
                }`}>

                {/* Header */}
                <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 px-6 py-4 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎬</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{booking.movieTitle}</h3>
                      <p className="text-gray-400 text-sm">{booking.theatreName}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Details */}
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Show Time</p>
                      <p className="text-white font-medium">
                        {new Date(booking.showTime).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(booking.showTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Booking Date</p>
                      <p className="text-white font-medium">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs mb-2">Seats</p>
                    <div className="flex gap-2 flex-wrap">
                      {booking.seats.map(seat => (
                        <span key={seat}
                          className="bg-gray-800 text-gray-300 border border-gray-700 text-sm px-3 py-1 rounded-full">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-gray-500 text-xs">Total Paid</p>
                      <p className="text-white font-bold text-xl">
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="border border-red-500/30 text-red-400 hover:bg-red-500/10 px-5 py-2 rounded-xl text-sm transition"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Orders() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  )
}