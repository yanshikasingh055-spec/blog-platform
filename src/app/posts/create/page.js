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
      if (profile?.role === 'viewer') { router.push('/'); return }
      setUser(user)
    }
    checkUser()
  }, [])

  const generateSummary = async (text) => {
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      return data.summary || ''
    } catch { return '' }
  }

  const handleSubmit = async () => {
    if (!title || !body) { setError('Title and content are required'); return }
    setLoading(true)
    setError('')

    let image_url = null

    // Upload image if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }
    }

    // Generate AI summary
    const summary = await generateSummary(body)

    const { error: insertError } = await supabase.from('posts').insert({
      title, body, image_url, summary, author_id: user.id
    })

    setLoading(false)
    if (insertError) { setError(insertError.message); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          className="w-full border p-3 rounded mb-4 text-gray-900"
          placeholder="Post Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded mb-4 text-gray-900 h-48 resize-none"
          placeholder="Write your post content here..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <label className="block text-sm text-gray-600 mb-2">Featured Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          className="mb-6 text-gray-700"
          onChange={e => setImageFile(e.target.files[0])}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Publishing... (generating AI summary)' : 'Publish Post'}
        </button>
      </div>
    </div>
  )
}