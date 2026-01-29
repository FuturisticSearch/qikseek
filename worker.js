export default {
  async fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname + url.search

    const hosts = [
      'https://1.qikseek.eu.org',      // Primary
      'https://2.qikseek.eu.org',      // Backup 1
      'https://3.qikseek.eu.org',      // Backup 2
      'https://qikseek.onrender.com',  // Backup 3
      'https://qikseek.netlify.app',   // Backup 4
      'https://qikseek.pages.dev'      // LAST resort (Pages)
    ]

    for (const host of hosts) {
      try {
        const res = await fetch(host + path, {
          redirect: 'manual',
          headers: request.headers
        })

        if (res.ok || res.status === 301 || res.status === 302) {
          const headers = new Headers(res.headers)

          // Keep control
          headers.delete('Location')

          // CORS
          headers.set('Access-Control-Allow-Origin', '*')

          // Canonical = eu.org always
          headers.set(
            'Link',
            `<https://qikseek.eu.org${path}>; rel="canonical"`
          )

          // Debug (remove later if you want)
          headers.set('X-Served-By', 'qikseek-worker')

          return new Response(res.body, {
            status: res.status >= 300 && res.status < 400 ? 200 : res.status,
            headers
          })
        }
      } catch (e) {
        // Host failed → try next
      }
    }

    return new Response(
      'All backends are currently unavailable. Please try again later or contact futuresearchapi@gmail.com',
      { status: 503 }
    )
  }
            }
