export async function POST(req) {
  const { text } = await req.json()

  try {
    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Text is required' }, { status: 400 })
    }

    const cleanText = text.replace(/\n/g, ' ').slice(0, 2000)
    const model = process.env.COHERE_MODEL || 'command-a-03-2025'

    const response = await fetch('https://api.cohere.ai/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: `Summarize the following blog post in 2-3 clear sentences. Only return the summary, nothing else: ${cleanText}`
          }
        ]
      })
    })

    const data = await response.json()
    if (!response.ok) {
      const apiMessage = data?.message || data?.error || `Cohere request failed (${response.status})`
      throw new Error(apiMessage)
    }

    const summary = data?.message?.content
      ?.map((part) => part?.text || '')
      .join(' ')
      .trim()

    if (!summary) throw new Error('No summary')

    return Response.json({ summary })

  } catch (error) {
    console.log('Cohere fallback reason:', error.message)
    const cleanText = text.replace(/\n/g, ' ')
    const fallback = cleanText
      .split('.')
      .filter(s => s.trim().length > 15)
      .slice(0, 2)
      .join('.')
      .trim() + '.'
    return Response.json({ summary: fallback })
  }
}