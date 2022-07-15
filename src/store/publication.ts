/* eslint-disable no-unused-vars */
import { BCharityPost } from '@generated/bcharitytypes'
import create from 'zustand'

interface PublicationState {
  showNewPostModal: boolean
  setShowNewPostModal: (showNewPostModal: boolean) => void
  parentPub: BCharityPost | null
  setParentPub: (parentPub: BCharityPost | null) => void
}

export const usePublicationStore = create<PublicationState>((set) => ({
  showNewPostModal: false,
  setShowNewPostModal: (showNewPostModal) => set(() => ({ showNewPostModal })),
  parentPub: null,
  setParentPub: (parentPub) => set(() => ({ parentPub }))
}))
