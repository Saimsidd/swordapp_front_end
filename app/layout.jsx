import './global.css'
import Navigation from './components/Navigation'

export const metadata = {
  title: 'Sword App',
  description: 'Your ultimate sword collection companion',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        <footer className="bg-base-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="footer footer-center p-4 text-base-content">
              <p>© 2024 Sword App - Your Collection, Your Adventure</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}