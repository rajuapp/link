import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({ req })
    const isAuth = !!token

    if (req.nextUrl.pathname.startsWith('/dashboard') && !isAuth) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (
      req.nextUrl.pathname.startsWith('/admin') &&
      isAuth &&
      token?.role !== 'admin' &&
      token?.email !== 'hello@raju.app'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (req.nextUrl.pathname.startsWith('/login') && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (req.nextUrl.pathname.startsWith('/register') && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (req.nextUrl.pathname === '/home' || req.nextUrl.pathname === '/home/') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      async authorized() {
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/admin',
    '/admin/:path*',
    '/home',
  ],
}
