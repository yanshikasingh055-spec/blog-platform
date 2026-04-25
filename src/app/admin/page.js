'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [comments, setComments] = useState([])
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('comments')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single()

      if (profile?.role !== 'admin') { router.push('/'); return }

      fetchAll()
    }
    init()
  }, [])

  const fetchAll = async () => {
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, users(name, email), posts(title)')
      .order('created_at', { ascending: false })

    const { data: postsData } = await supabase
      .from('posts')
      .select('*, users(name)')
      .order('created_at', { ascending: false })

    const { data: usersData } = await supabase
      .from('users')
      .select('*')

    setComments(commentsData || [])
    setPosts(postsData || [])
    setUsers(usersData || [])
    setLoading(false)
  }

  const deleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(comments.filter(c => c.id !== commentId))
  }

  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', postId)
    setPosts(posts.filter(p => p.id !== postId))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <p style={{ color: 'var(--muted)' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(250,248,245,0.95)',
        padding: '1rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button onClick={() => router.push('/')} style={{
          color: 'var(--muted)', fontSize: '0.875rem',
          background: 'none', border: 'none', cursor: 'pointer'
        }}>
          ← Back to Home
        </button>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)'
        }}>
          Admin <span style={{ color: 'var(--accent)' }}>Dashboard</span>
        </span>
        <span style={{
          background: 'var(--accent-light)', color: 'var(--accent)',
          padding: '0.3rem 0.85rem', borderRadius: '2rem',
          fontSize: '0.8rem', fontWeight: 600
        }}>
          Admin
        </span>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Posts', value: posts.length, emoji: '📝' },
            { label: 'Total Comments', value: comments.length, emoji: '💬' },
            { label: 'Total Users', value: users.length, emoji: '👥' },
          ].map(({ label, value, emoji }) => (
            <div key={label} style={{
              background: 'white', borderRadius: '12px',
              border: '1px solid var(--border)', padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{emoji}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['comments', 'posts', 'users'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '2rem',
              border: '1px solid var(--border)',
              background: activeTab === tab ? 'var(--ink)' : 'white',
              color: activeTab === tab ? 'white' : 'var(--ink)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontWeight: 500
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--ink)', margin: 0 }}>
                All Comments ({comments.length})
              </h2>
            </div>
            {comments.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No comments yet.</p>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--ink)', margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                      {c.comment_text}
                    </p>
                    <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.75rem' }}>
                      By <strong>{c.users?.name}</strong> on <strong>{c.posts?.title}</strong>
                    </p>
                  </div>
                  <button onClick={() => deleteComment(c.id)} style={{
                    background: '#fef2f2', color: '#ef4444',
                    border: '1px solid #fecaca', borderRadius: '6px',
                    padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--ink)', margin: 0 }}>
                All Posts ({posts.length})
              </h2>
            </div>
            {posts.map(p => (
              <div key={p.id} style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--ink)', margin: '0 0 0.25rem', fontWeight: 500 }}>{p.title}</p>
                  <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.75rem' }}>
                    By <strong>{p.users?.name}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => router.push(`/posts/edit/${p.id}`)} style={{
                    background: '#fffbeb', color: '#f59e0b',
                    border: '1px solid #fde68a', borderRadius: '6px',
                    padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer'
                  }}>
                    Edit
                  </button>
                  <button onClick={() => deletePost(p.id)} style={{
                    background: '#fef2f2', color: '#ef4444',
                    border: '1px solid #fecaca', borderRadius: '6px',
                    padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer'
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--ink)', margin: 0 }}>
                All Users ({users.length})
              </h2>
            </div>
            {users.map(u => (
              <div key={u.id} style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ color: 'var(--ink)', margin: '0 0 0.25rem', fontWeight: 500 }}>{u.name}</p>
                  <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.75rem' }}>{u.email}</p>
                </div>
                <span style={{
                  background: u.role === 'admin' ? '#fef3c7' : u.role === 'author' ? '#dbeafe' : '#f0fdf4',
                  color: u.role === 'admin' ? '#d97706' : u.role === 'author' ? '#2563eb' : '#16a34a',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}