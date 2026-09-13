export function renderExpiredHtml(
  slug: string,
  reason: string,
  message: string
): string {
  let title = 'Link No Longer Available'
  let subtitle = 'HTTP 410 Gone'

  if (reason === 'deactivated') {
    title = 'Link Deactivated'
  } else if (reason === 'max_clicks') {
    title = 'Click Limit Reached'
  } else if (reason === 'expired') {
    title = 'Link Expired'
  }

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Link</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #09090b;
      color: #fafafa;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1.25rem;
      padding: 2.5rem 2rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 1rem;
      background: #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      border: 1px solid #3f3f46;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.25);
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.625rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.025em;
    }
    p {
      color: #a1a1aa;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 2rem;
    }
    .slug-box {
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      margin-bottom: 2rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875rem;
      color: #d4d4d8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .slug-box .domain {
      color: #71717a;
    }
    .slug-box .slug {
      color: #f43f5e;
      font-weight: 600;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.5rem;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #ffffff;
      color: #09090b;
    }
    .btn-primary:hover {
      background: #e4e4e7;
    }
    .btn-secondary {
      background: transparent;
      color: #a1a1aa;
      border: 1px solid #27272a;
    }
    .btn-secondary:hover {
      color: #ffffff;
      background: #27272a;
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #71717a;
    }
    .footer a {
      color: #a1a1aa;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    </div>
    <div class="badge">${subtitle}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="slug-box">
      <span class="domain">/${slug}</span>
    </div>
    <div class="actions">
      <a href="/" class="btn btn-primary">Return to Home</a>
      <a href="/dashboard" class="btn btn-secondary">Create Your Own Link</a>
    </div>
    <div class="footer">
      Powered by <a href="/">Link</a> &bull; Fast & Reliable Short URLs
    </div>
  </div>
</body>
</html>`
}
