/* eslint-disable no-unused-vars */
import { BCharityPost } from '@generated/bcharitytypes'
import create from 'zustand'

interface PublicationState {
  showNewPostModal: boolean
  setShowNewPostModal: (showNewPostModal: boolean) => void
  showShareModal: boolean
  setShowShareModal: (showShareModal: boolean) => void
  parentPub: BCharityPost | null
  setParentPub: (parentPub: BCharityPost | null) => void
}

export const usePublicationStore = create<PublicationState>((set) => ({
  showNewPostModal: false,
  setShowNewPostModal: (showNewPostModal) => set(() => ({ showNewPostModal })),
  showShareModal: false,
  setShowShareModal: (showShareModal) => set(() => ({ showShareModal })),
  parentPub: null,
  setParentPub: (parentPub) => set(() => ({ parentPub }))
}))
