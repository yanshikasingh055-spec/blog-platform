'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async () => {
    setError('')
    setLoading(true)

    // Log role to confirm it's correct
    console.log('Signing up with role:', role)

    const { data, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password 
    })
    
    if (signUpError) { 
      setError(signUpError.message)
      setLoading(false)
      return 
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert({ 
        id: data.user.id, 
        name, 
        email, 
        role  // this will now correctly save selected role
      })

    if (profileError) { 
      setError(profileError.message)
      setLoading(false)
      return 
    }

    setLoading(false)
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Create Account</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input 
          className="w-full border p-2 rounded mb-3 text-gray-900" 
          placeholder="Full Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <input 
          className="w-full border p-2 rounded mb-3 text-gray-900" 
          placeholder="Email" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          className="w-full border p-2 rounded mb-3 text-gray-900" 
          placeholder="Password (min 6 chars)" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <label className="block text-sm text-gray-600 mb-1">Select Role</label>
        <select 
          className="w-full border p-2 rounded mb-4 text-gray-900" 
          value={role} 
          onChange={e => {
            console.log('Role selected:', e.target.value)
            setRole(e.target.value)
          }}
        >
          <option value="viewer">Viewer</option>
          <option value="author">Author</option>
          <option value="admin">Admin</option>
        </select>
        <button 
          onClick={handleSignUp} 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  )
}