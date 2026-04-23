'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input className="w-full border p-2 rounded mb-3" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded mb-3" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        <p className="mt-4 text-center text-sm">No account? <a href="/signup" className="text-blue-600">Sign Up</a></p>
      </div>
    </div>
  )
}