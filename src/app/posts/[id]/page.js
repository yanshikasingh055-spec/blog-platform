'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function PostDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [author, setAuthor] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (profile) setUserRole(profile.role)
      }

      const { data: postData } = await supabase.from('posts').select('*').eq('id', id).single()
      if (!postData) { router.push('/'); return }
      setPost(postData)

      const { data: authorData } = await supabase.from('users').select('name, role').eq('id', postData.author_id).single()
      setAuthor(authorData)

      const { data: commentsData } = await supabase
        .from('comments').select('*, users(name)').eq('post_id', id).order('created_at', { ascending: true })
      setComments(commentsData || [])
      setLoading(false)
    }
    init()
  }, [id])

  const handleComment = async () => {
    if (!newComment.trim()) return
    if (!user) { alert('Please login to comment'); return }
    
    console.log('Commenting as user:', user.id)
    console.log('Comment text:', newComment)
    
    const { data, error } = await supabase.from('comments').insert({
      post_id: id,
      user_id: user.id,
      comment_text: newComment.trim()
    })
    
    console.log('Comment result:', data, error)
    
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    
    setNewComment('')
    const { data: commentsData } = await supabase
      .from('comments').select('*, users(name)').eq('post_id', id).order('created_at', { ascending: true })
    setComments(commentsData || [])
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      alert('Delete failed: ' + error.message)
      return
    }
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav style={{
  borderBottom: '1px solid var(--border)',
  background: 'rgba(250,248,245,0.95)',
  padding: '1rem 2.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 50
}}>
  <button onClick={() => router.push('/')} style={{
    color: 'var(--muted)',
    fontSize: '0.875rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  }}>
    ← Back to Home
  </button>

  <a href="/" style={{
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--ink)',
    textDecoration: 'none'
  }}>
    The <span style={{ color: 'var(--accent)' }}>Blog</span>
  </a>

  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    {user && (
      <span style={{
        color: 'var(--accent)',
        fontSize: '0.8rem',
        fontWeight: 600,
        background: 'var(--accent-light)',
        padding: '0.3rem 0.85rem',
        borderRadius: '2rem',
        textTransform: 'capitalize'
      }}>
        {userRole}
      </span>
    )}
    {(userRole === 'admin' || user?.id === post?.author_id) && (
      <>
        <button onClick={() => router.push(`/posts/edit/${id}`)} style={{
          background: '#f59e0b',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1.25rem',
          borderRadius: '2rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontWeight: 500
        }}>
          Edit
        </button>
        <button onClick={handleDelete} style={{
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1.25rem',
          borderRadius: '2rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontWeight: 500
        }}>
          Delete
        </button>
      </>
    )}
  </div>
</nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
        <p className="text-sm text-gray-500 mb-2">By {author?.name} · {new Date(post.created_at).toLocaleDateString()}</p>

        {/* AI Summary Box */}
        {post.summary && (
          <div style={{
            background: 'linear-gradient(135deg, #fef9f0, #fdf3e3)',
            border: '1px solid var(--accent)',
            borderLeft: '4px solid var(--accent)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1rem' }}>✨</span>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>AI Generated Summary</p>
          </div>
          <p style={{ color: '#7c5a2a', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{post.summary}</p>
         </div>
        )}

        <div className="prose text-gray-800 leading-relaxed mb-10 whitespace-pre-wrap">{post.body}</div>

        {/* Comments Section */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">💬 Comments ({comments.length})</h2>

          {comments.map(c => (
            <div key={c.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <p className="text-sm font-semibold text-gray-700">{c.users?.name}</p>
              <p className="text-gray-600 mt-1">{c.comment_text}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
            </div>
          ))}

          {user ? (
            <div className="mt-4">
              <textarea
                className="w-full border p-3 rounded-lg text-gray-900 resize-none h-24"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button
                onClick={handleComment}
                className="mt-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Post Comment
              </button>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">
              <a href="/login" className="text-blue-600 hover:underline">Login</a> to leave a comment.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}