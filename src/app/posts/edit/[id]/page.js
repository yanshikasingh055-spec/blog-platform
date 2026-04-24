'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function EditPost() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()
      if (!post) { router.push('/'); return }
      setTitle(post.title)
      setBody(post.body)
    }
    init()
  }, [id])

  const handleUpdate = async () => {
    if (!title || !body) { setError('Title and content are required'); return }
    setLoading(true)

    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body })
    })
    const { summary } = await res.json()

    const { error: updateError } = await supabase
      .from('posts').update({ title, body, summary }).eq('id', id)

    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    router.push(`/posts/${id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push(`/posts/${id}`)}
          style={{ color: 'var(--muted)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to Post
        </button>
        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--ink)' }}>
          The <span style={{ color: 'var(--accent)' }}>Blog</span>
        </span>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
            Edit Post
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Update your post — AI summary will regenerate automatically.</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem' }}>Post Title</label>
            <input
              placeholder="Post title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '1rem', outline: 'none', fontFamily: 'Playfair Display, serif' }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem' }}>Content</label>
            <textarea
              placeholder="Post content..."
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.95rem', outline: 'none', height: '280px', resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleUpdate}
              disabled={loading}
              style={{ flex: 1, background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '8px', padding: '1rem', fontSize: '0.95rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '✨ Updating...' : 'Update Post'}
            </button>
            <button
              onClick={() => router.push(`/posts/${id}`)}
              style={{ flex: 1, background: 'white', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', fontSize: '0.95rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}