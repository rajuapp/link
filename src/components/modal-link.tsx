'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { DialogHeader } from './ui/dialog'
import { LinkForm as LinkData } from '@/lib/validations/link'
import { LinkForm } from './link-form'
import { Dispatch, SetStateAction } from 'react'

interface ModalLinkProps {
  id?: string
  defaultValues?: Partial<LinkData> & {
    id?: string
    hasPassword?: boolean
  }
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export function ModalLink(props: ModalLinkProps) {
  const { defaultValues, isOpen, setIsOpen, id } = props

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? 'Edit Link' : 'Create Link'}
          </DialogTitle>
        </DialogHeader>
        <LinkForm id={id} defaultValues={defaultValues} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
