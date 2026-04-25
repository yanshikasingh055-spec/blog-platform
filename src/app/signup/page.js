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
    console.log('Signing up with role:', role)
  
    // Step 1 — Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name, role } // store role in auth metadata too
      }
    })
    
    if (signUpError) { 
      setError(signUpError.message)
      setLoading(false)
      return 
    }
  
    if (!data.user) {
      setError('Signup failed, please try again')
      setLoading(false)
      return
    }
  
    // Step 2 — Insert profile with correct role
    const { error: profileError } = await supabase
      .from('users')
      .upsert({ 
        id: data.user.id, 
        name, 
        email, 
        role  // this saves the selected role
      }, { onConflict: 'id' }) // if exists, update it
  
    if (profileError) { 
      setError(profileError.message)
      setLoading(false)
      return 
    }
  
    setLoading(false)
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
            Join us
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Create your account to get started</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {[
            { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'name' },
            { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label} style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem' }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => setter(e.target.value)}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          ))}

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem' }}>Role</label>
            <select
              value={role}
              onChange={e => { console.log('Role:', e.target.value); setRole(e.target.value) }}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', background: 'white' }}>
              <option value="viewer">Viewer — Read & comment on posts</option>
              <option value="author">Author — Create & manage posts</option>
              <option value="admin">Admin — Manage all content</option>
            </select>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            style={{ width: '100%', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center mt-6" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}