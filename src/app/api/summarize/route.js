export async function POST(req) {
    const { text } = await req.json()
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ 
                text: `You are a helpful assistant. Summarize the following blog post in exactly 2-3 clear, informative sentences: ${text.slice(0, 2000)}` 
              }]
            }]
          })
        }
      )
  
      const data = await response.json()
      console.log('Gemini response:', JSON.stringify(data).slice(0, 200))
  
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text
  
      if (!summary) {
        console.log('Gemini failed, using fallback')
        throw new Error('No summary from Gemini')
      }
  
      return Response.json({ summary })
  
    } catch (error) {
      // Fallback if Gemini fails
      const cleanText = text.replace(/#+\s/g, '').replace(/\n+/g, ' ').trim()
      const fallback = cleanText
        .split('.')
        .filter(s => s.trim().length > 15)
        .slice(0, 2)
        .join('.')
        .trim() + '.'
      return Response.json({ summary: fallback })
    }
  }