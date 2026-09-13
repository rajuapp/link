'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent, useState } from 'react'
import {
  Loader2,
  MoreVertical,
  Power,
  PowerOff,
  Edit3,
  Copy,
  Trash2,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { ModalLink } from '@/components/modal-link'
import { toast } from '@/components/ui/use-toast'
import { onCopy } from '@/lib/utils'

interface LinkOperationsProps {
  domain: string
  url: string
  description?: string
  id: string
  expiresAt?: Date | string | null
  maxClicks?: number | null
  isActive?: boolean
  hasPassword?: boolean
}

export function LinkOperations(props: LinkOperationsProps) {
  const {
    domain,
    url,
    description,
    id,
    expiresAt,
    maxClicks,
    isActive = true,
    hasPassword = false,
  } = props

  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false)
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
  const [isToggleLoading, setIsToggleLoading] = useState<boolean>(false)

  const router = useRouter()

  async function toggleStatus() {
    try {
      setIsToggleLoading(true)
      const res = await fetch(`/api/link/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            isActive: !isActive,
          },
        }),
      })

      if (res.ok) {
        toast({
          description: !isActive
            ? 'Link activated successfully'
            : 'Link deactivated (returning 410 Gone)',
        })
        router.refresh()
      } else {
        toast({
          title: 'Action failed',
          description: 'Failed to update link status.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Action failed',
        description: 'An error occurred while updating status.',
        variant: 'destructive',
      })
    } finally {
      setIsToggleLoading(false)
    }
  }

  async function deleteLink(event: MouseEvent<HTMLButtonElement>) {
    try {
      event.preventDefault()
      setIsDeleteLoading(true)

      await fetch(`/api/link/${id}`, {
        method: 'DELETE',
      })

      toast({
        description: 'Link deleted successfully.',
      })
    } catch {
      toast({
        description: 'An error occurred while deleting the link.',
        variant: 'destructive',
      })
    } finally {
      router.refresh()
      setShowDeleteAlert(false)
      setIsDeleteLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isToggleLoading}
          className='flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted focus:outline-none'
        >
          {isToggleLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <MoreVertical className='h-4 w-4' />
          )}
          <span className='sr-only'>Open</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          <DropdownMenuItem
            onClick={() => {
              onCopy(domain)
              toast({
                description: 'Link copied with success',
              })
            }}
          >
            <Copy className='mr-2 h-4 w-4' />
            Copy Link
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Edit3 className='mr-2 h-4 w-4' />
            Edit Link
          </DropdownMenuItem>

          <DropdownMenuItem onClick={toggleStatus}>
            {isActive ? (
              <>
                <PowerOff className='mr-2 h-4 w-4 text-amber-500' />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <Power className='mr-2 h-4 w-4 text-emerald-500' />
                <span>Activate</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteAlert(true)}
            className='text-destructive focus:text-destructive'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this link?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the selected link. Are you
              sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleteLoading}
              variant='destructive'
              onClick={deleteLink}
            >
              {isDeleteLoading && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ModalLink
        id={id}
        isOpen={showEdit}
        setIsOpen={setShowEdit}
        defaultValues={{
          domain,
          url,
          description: description || '',
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          maxClicks: maxClicks ?? null,
          isActive: isActive !== false,
          hasPassword,
        }}
      />
    </>
  )
}
