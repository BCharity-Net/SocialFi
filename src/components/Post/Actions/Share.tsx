import { Modal } from '@components/UI/Modal'
import { Tooltip } from '@components/UI/Tooltip'
import { BCharityPost } from '@generated/bcharitytypes'
import { ShareIcon } from '@heroicons/react/outline'
import { ShareIcon as ShareIconSolid } from '@heroicons/react/solid'
import { motion } from 'framer-motion'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface Props {
  post: BCharityPost
}

const Share: FC<Props> = ({ post }) => {
  const { t } = useTranslation('common')
  const [liked, setLiked] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)
  const [showShareModal, setShowShareModal] = useState<boolean>(false)

  const ShareModal = (postId: string) => {
    console.log('share post', postId)
    return (
      <Modal
        title={t('Share')}
        icon={<ShareIcon className="w-5 h-5 text-brand" />}
        size="md"
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
      >
        <div className="text-center text-xl font-bold center">
          {'Share with your friends!'}
        </div>
        <br></br>
        <div className="text-center text-m font-bold center">
          Or copy the link
        </div>
        <div>
          {/* make a button that copies url */}
          <input
            type="text"
            value={`${window.location.origin}/posts/${postId}`}
            className="w-full h-10 p-2 border border-gray-300 rounded-lg"
            readOnly
          />
        </div>
      </Modal>
    )
  }
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setShowShareModal(!showShareModal)
        }}
        aria-label="Like"
        data-test="publication-like"
      >
        <div className="flex items-center space-x-1 text-gray-500">
          <div className="p-1.5 rounded-full hover:bg-gray-300 hover:bg-opacity-20">
            <Tooltip
              placement="top"
              content={liked ? 'Share' : 'Share'}
              withDelay
            >
              {liked ? (
                <ShareIconSolid className="w-[18px]" />
              ) : (
                <ShareIcon className="w-[18px]" />
              )}
            </Tooltip>
          </div>
        </div>
      </motion.button>
      {showShareModal && ShareModal(post.id)}
    </>
  )
}

export default Share
