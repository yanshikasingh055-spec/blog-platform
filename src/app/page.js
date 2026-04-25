'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [page, setPage] = useState(1)
  const postsPerPage = 6

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('users').select('role').eq('id', user.id).single()
        if (profile) setUserRole(profile.role)
      }
    }
    getUser()
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, summary, image_url, created_at, author_id')
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * postsPerPage, page * postsPerPage)
  const totalPages = Math.ceil(filtered.length / postsPerPage)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

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
        zIndex: 50,
        backdropFilter: 'blur(8px)'
      }}>
        <a href="/" style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--ink)',
          textDecoration: 'none'
        }}>
          The <span style={{ color: 'var(--accent)' }}>Blog</span>
        </a>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
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
              {userRole === 'author' && (
                <Link href="/posts/create" style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '2rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}>
                  + New Post
                </Link>
              )}
              {userRole === 'admin' && (
               <Link href="/admin" style={{
                 background: 'var(--ink)',
                 color: 'white',
                 padding: '0.5rem 1.25rem',
                 borderRadius: '2rem',
                 fontSize: '0.85rem',
                 fontWeight: 500,
                 textDecoration: 'none'
               }}>
                  Dashboard
               </Link>
              )}


              <button onClick={handleLogout} style={{
                color: 'var(--muted)',
                fontSize: '0.85rem',
                background: 'none',
                border: '1px solid var(--border)',
                padding: '0.4rem 1rem',
                borderRadius: '2rem',
                cursor: 'pointer'
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                color: 'var(--muted)',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}>
                Login
              </Link>
              <Link href="/signup" style={{
                background: 'var(--ink)',
                color: 'white',
                padding: '0.5rem 1.25rem',
                borderRadius: '2rem',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '5rem 1.5rem 4rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <p style={{
          color: 'var(--accent)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem'
        }}>
          Welcome to our publication
        </p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 700,
          color: 'var(--ink)',
          lineHeight: 1.15,
          marginBottom: '1.5rem'
        }}>
          Stories worth<br />
          <em style={{ color: 'var(--accent)' }}>reading.</em>
        </h1>
        <p style={{
          color: 'var(--muted)',
          maxWidth: '440px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
          fontSize: '1rem'
        }}>
          Explore ideas, insights, and stories from our community of writers.
        </p>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <input
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: '2rem',
              padding: '0.85rem 1.5rem',
              fontSize: '0.95rem',
              outline: 'none',
              background: 'white',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
            }}
            placeholder="Search posts..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {paginated.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '5rem 0' }}>
            No posts found.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {paginated.map((post, i) => (
              <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Image */}
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      height: '160px',
                      background: `hsl(${(i * 53) % 360}, 18%, 92%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--muted)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontWeight: 500
                      }}>
                        No Image
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      marginBottom: '0.75rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.title}
                    </h2>
                    <p style={{
                      color: 'var(--muted)',
                      fontSize: '0.85rem',
                      lineHeight: 1.65,
                      marginBottom: '1.25rem',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.summary || 'Click to read this post...'}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border)'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent)',
                        fontWeight: 600,
                        letterSpacing: '0.03em'
                      }}>
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  border: '1px solid var(--border)',
                  background: page === i + 1 ? 'var(--ink)' : 'white',
                  color: page === i + 1 ? 'white' : 'var(--ink)',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}