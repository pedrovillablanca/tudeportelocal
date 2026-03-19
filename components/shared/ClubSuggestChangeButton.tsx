'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SuggestChangeModal } from '@/components/forms/SuggestChangeModal'

interface ClubSuggestChangeButtonProps {
  clubId: string
  clubName: string
}

export function ClubSuggestChangeButton({ clubId, clubName }: ClubSuggestChangeButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-500 mb-3">
          ¿Información desactualizada?
        </p>
        <Button variant="outline" onClick={() => setModalOpen(true)}>
          Sugerir cambio
        </Button>
      </div>

      <SuggestChangeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        clubId={clubId}
        clubName={clubName}
      />
    </>
  )
}
