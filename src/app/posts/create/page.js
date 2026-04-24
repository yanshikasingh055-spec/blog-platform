'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'author') { router.push('/'); return }
      setUser(user)
    }
    checkUser()
  }, [])

  const handleSubmit = async () => {
    if (!title || !body) { setError('Title and content are required'); return }
    setLoading(true)
    setError('')

    let image_url = null
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('post-images').upload(fileName, imageFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }
    }

    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body })
    })
    const { summary } = await res.json()

    const { error: insertError } = await supabase.from('posts').insert({
      title, body, image_url, summary, author_id: user.id
    })

    setLoading(false)
    if (insertError) { setError(insertError.message); return }
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/')}
          style={{ color: 'var(--muted)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          ← Back to Home
        </button>
        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--ink)' }}>
          The <span style={{ color: 'var(--accent)' }}>Blog</span>
        </span>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
            Create New Post
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Write your story — an AI summary will be generated automatically.
          </p>
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
              placeholder="Enter a compelling title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '1rem', outline: 'none', fontFamily: 'Playfair Display, serif' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem' }}>Content</label>
            <textarea
              placeholder="Write your post content here..."
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.95rem', outline: 'none', height: '280px', resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem' }}>
              Featured Image <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🖼️</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>
                  {imageFile ? imageFile.name : 'Click to upload an image'}
                </p>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: loading ? 'var(--muted)' : 'var(--ink)', color: 'white', border: 'none', borderRadius: '8px', padding: '1rem', fontSize: '0.95rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}>
            {loading ? '✨ Generating AI summary & publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>
    </div>
  )
}