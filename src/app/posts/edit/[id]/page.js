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

    // Regenerate summary on edit
    let summary = ''
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body })
      })
      const data = await res.json()
      summary = data.summary || ''
    } catch {}

    const { error: updateError } = await supabase
      .from('posts').update({ title, body, summary }).eq('id', id)

    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    router.push(`/posts/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          className="w-full border p-3 rounded mb-4 text-gray-900"
          placeholder="Post Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded mb-6 text-gray-900 h-48 resize-none"
          placeholder="Post content..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Post'}
          </button>
          <button
            onClick={() => router.push(`/posts/${id}`)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}