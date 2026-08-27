'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/authContext'
import { Button } from '@/components/common/Button'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { BarChart3, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields')
      }
      await signIn(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="w-10 h-10 text-primary-600" />
            <span className="text-2xl font-bold text-neutral-900">AssetHealth</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
          <p className="text-neutral-600">Sign in to your account</p>
        </div>

        {/* Sign In Card */}
        <Card className="mb-6">
          <CardBody>
            {error && (
              <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0" />
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-neutral-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardBody>
            <p className="text-xs font-semibold text-blue-900 mb-2">Demo Account:</p>
            <p className="text-xs text-blue-800">
              Email: <code className="bg-blue-100 px-2 py-1 rounded">demo@example.com</code>
            </p>
            <p className="text-xs text-blue-800 mt-1">
              Password: <code className="bg-blue-100 px-2 py-1 rounded">demo123456</code>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
