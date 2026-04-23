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
    const { error } = await supabase.from('comments').insert({
      post_id: id, user_id: user.id, comment_text: newComment
    })
    if (!error) {
      setNewComment('')
      const { data } = await supabase
        .from('comments').select('*, users(name)').eq('post_id', id).order('created_at', { ascending: true })
      setComments(data || [])
    }
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
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button onClick={() => router.push('/')} className="text-blue-600 hover:underline text-sm">← Back to Home</button>
        <div className="flex gap-3">
          {(userRole === 'admin' || user?.id === post.author_id) && (
            <>
              <button onClick={() => router.push(`/posts/edit/${id}`)} className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600">Edit</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600">Delete</button>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-xs font-bold text-blue-600 mb-1">🤖 AI Summary</p>
            <p className="text-sm text-blue-800">{post.summary}</p>
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