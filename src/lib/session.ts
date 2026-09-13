import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return session?.user
  }

  try {
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: true, name: true, email: true, image: true, role: true },
    })

    if (!dbUser) {
      return session.user
    }

    return {
      ...session.user,
      id: dbUser.id,
      role: dbUser.role ?? 'user',
    }
  } catch {
    return session.user
  }
}
