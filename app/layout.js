import { AuthProvider } from '../context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'MovieBook',
  description: 'Book movie tickets online',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}