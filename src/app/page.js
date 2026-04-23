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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">📝 Blog Platform</h1>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600">Role: <strong>{userRole}</strong></span>
              {(userRole === 'author') && (
                <Link href="/posts/create" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ New Post</Link>
              )}
              <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <input
          className="w-full border p-3 rounded-lg mb-8 text-gray-900"
          placeholder="Search posts..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map(post => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer overflow-hidden">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h2 className="font-bold text-gray-900 text-lg mb-2">{post.title}</h2>
                  <p className="text-gray-500 text-sm line-clamp-3">{post.summary || 'No summary available.'}</p>
                  <p className="text-xs text-gray-400 mt-3">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {paginated.length === 0 && (
          <p className="text-center text-gray-500 mt-12">No posts found.</p>
        )}
      </div>
    </div>
  )
}