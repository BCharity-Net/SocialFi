import { Card, CardBody } from '@components/UI/Card'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { STATIC_ASSETS } from 'src/constants'
import { useStreak } from 'use-streak'

const Day = ({ day }: { day: number }) => (
  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
    <img
      className="w-10 h-10"
      height={40}
      width={40}
      src={`${STATIC_ASSETS}/streak/${day}.png`}
      alt={`Day ${day}`}
    />
  </motion.button>
)

const Streak = () => {
  const today = new Date()
  const { t } = useTranslation('common')
  const streak =
    // eslint-disable-next-line
    typeof window !== 'undefined' ? useStreak(localStorage, today) : undefined

  if ((streak?.currentCount as number) > 5) return null

  return (
    <Card className="mb-4">
      <CardBody className="flex justify-between items-center space-y-2">
        <div>
          <div>{t("You're on a")}</div>
          <div className="text-xl">
            {streak && streak.currentCount} {t('Day streak')} 🌿
          </div>
        </div>
        <div>{streak && <Day day={streak.currentCount} />}</div>
      </CardBody>
    </Card>
  )
}

export default Streak
