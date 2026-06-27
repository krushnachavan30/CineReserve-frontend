'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import Navbar from '../../../components/Navbar'
import API from '../../../lib/axios'

export default function ShowSeats({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [seats, setSeats] = useState([])
  const [show, setShow] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [locking, setLocking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSeats()
  }, [id])

  const fetchSeats = async () => {
    try {
      const res = await API.get(`/shows/${id}/seats`)
      setSeats(res.data.seats)
      setShow(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSeat = (seat) => {
    if (seat.isBooked || seat.isLocked) return

    setSelectedSeats(prev => {
      if (prev.includes(seat.seatNumber)) {
        return prev.filter(s => s !== seat.seatNumber)
      }
      if (prev.length >= 6) {
        setError('Maximum 6 seats select kar sakte ho')
        return prev
      }
      setError('')
      return [...prev, seat.seatNumber]
    })
  }

  const handleProceed = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (selectedSeats.length === 0) {
      setError('Pehle seats select karo')
      return
    }

    setLocking(true)
    setError('')

    try {
      // Seats lock karo — Redis mein 10 min ke liye
      await API.post('/shows/lock-seats', {
        showId: id,
        seats: selectedSeats
      })

      // Booking page pe jao
      const seatsParam = selectedSeats.join(',')
      router.push(`/booking/${id}?seats=${seatsParam}`)

    } catch (err) {
      setError(err.response?.data?.message || 'Seats lock nahi hui — dobara try karo')
    } finally {
      setLocking(false)
    }
  }

  // Rows mein seats group karo
  const groupSeatsByRow = () => {
    const rows = {}
    seats.forEach(seat => {
      const row = seat.seatNumber[0]
      if (!rows[row]) rows[row] = []
      rows[row].push(seat)
    })
    return rows
  }

  const totalAmount = selectedSeats.length * (show?.price?.standard || 0)

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading seats...</p>
      </div>
    </div>
  )

  const rows = groupSeatsByRow()

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Select Seats</h1>
        <p className="text-gray-400 mb-8">Apni pasand ki seats choose karo</p>

        {/* Screen */}
        <div className="mb-10">
          <div className="w-full bg-gradient-to-b from-gray-400 to-gray-700 h-2 rounded-full mb-2" />
          <p className="text-center text-gray-500 text-xs tracking-widest uppercase">Screen</p>
        </div>

        {/* Seat Legend */}
        <div className="flex items-center gap-6 mb-8 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-700 rounded-md border border-gray-600" />
            <span className="text-gray-400 text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded-md" />
            <span className="text-gray-400 text-sm">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md border border-gray-700" />
            <span className="text-gray-400 text-sm">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500/30 rounded-md border border-yellow-500/50" />
            <span className="text-gray-400 text-sm">Locked</span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="flex flex-col gap-3 mb-10">
          {Object.entries(rows).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-3">
              {/* Row Label */}
              <span className="text-gray-500 text-sm w-6 text-center font-mono">{row}</span>

              {/* Seats */}
              <div className="flex gap-2 flex-wrap">
                {rowSeats.map(seat => (
                  <button
                    key={seat.seatNumber}
                    onClick={() => toggleSeat(seat)}
                    disabled={seat.isBooked || seat.isLocked}
                    className={`w-8 h-8 rounded-md text-xs font-semibold transition ${
                      seat.isBooked
                        ? 'bg-gray-900 border border-gray-800 text-gray-700 cursor-not-allowed'
                        : seat.isLocked
                        ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-600 cursor-not-allowed'
                        : selectedSeats.includes(seat.seatNumber)
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105'
                    }`}
                  >
                    {seat.seatNumber.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
          <div>
            {selectedSeats.length > 0 ? (
              <>
                <p className="text-gray-400 text-sm mb-1">Selected Seats</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="bg-red-500/20 text-red-400 border border-red-500/30 text-sm px-3 py-1 rounded-full">
                      {seat}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">Koi seat select nahi ki</p>
            )}
          </div>

          <div className="text-right">
            {selectedSeats.length > 0 && (
              <p className="text-white font-bold text-2xl mb-3">
                ₹{totalAmount.toLocaleString('en-IN')}
              </p>
            )}
            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0 || locking}
              className="bg-red-500 hover:bg-red-600 text-white px-10 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locking ? 'Locking seats...' : 'Proceed to Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}