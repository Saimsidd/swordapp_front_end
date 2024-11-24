'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(formData) {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.get('email'),
          password: formData.get('password'),
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to login')
      }

      // Store tokens
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        email: formData.get('email'),
        isLoggedIn: true
      }))

      // Debug log
      console.log('Login successful, token:', data.access)

      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold">Welcome Back!</h2>
          </div>
          <p className="text-center text-base-content/60 mb-6">
            Log in to your account
          </p>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input 
                type="email" 
                name="email"
                placeholder="you@example.com" 
                className="input input-bordered" 
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                className="input input-bordered" 
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </div>
          </form>

          <p className="text-center mt-6 text-sm">
            Don't have an account?{' '}
            <Link href="/" className="link link-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}