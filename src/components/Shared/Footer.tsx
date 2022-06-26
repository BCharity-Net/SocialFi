import AppContext from '@components/utils/AppContext'
import Link from 'next/link'
import { FC, useContext } from 'react'

const Footer: FC = () => {
  const { staffMode } = useContext(AppContext)

  return (
    <footer
      className={`mt-4 leading-7 text-sm sticky flex flex-wrap px-3 lg:px-0 gap-x-[12px] ${
        staffMode ? 'top-28' : 'top-20'
      }`}
    >
      <span className="font-bold text-gray-500 dark:text-gray-300">
        © BCharity
      </span>
      <a
        href="https://polygive.gitbook.io/bcharity/"
        target="_blank"
        rel="noreferrer noopener"
      >
        About
      </a>
      <a
        href="https://discord.gg/4vKS59q5kV"
        target="_blank"
        rel="noreferrer noopener"
      >
        Discord
      </a>
      <a
        href="https://twitter.com/BCharityFi"
        target="_blank"
        rel="noreferrer noopener"
      >
        Twitter
      </a>
      <a
        href="https://t.me/BCharitynet"
        target="_blank"
        rel="noreferrer noopener"
      >
        Telegram
      </a>
      <a
        href=""
        target="_blank"
        rel="noreferrer noopener"
      >
        Donate
      </a>
      <a
        href=""
        target="_blank"
        rel="noreferrer noopener"
      >
        Status
      </a>
      <a
        href="https://snapshot.org/#/igive.eth"
        target="_blank"
        rel="noreferrer noopener"
      >
        Vote
      </a>
      <a
        href="https://github.com/BCharity-Net/SocialFi"
        target="_blank"
        rel="noreferrer noopener"
      >
        GitHub
      </a>
      <Link href="/thanks" prefetch={false}>
        <a href="/thanks">Thanks</a>
      </Link>
      <Link href="/privacy" prefetch={false}>
        <a href="/privacy">Privacy</a>
      </Link>
      <Link href="/terms" prefetch={false}>
        <a href="/terms">Terms</a>
      </Link>
      {/* <a
        className="pr-3 hover:font-bold"
        href="https://vercel.com/bcharity?utm_source=BCharity&utm_campaign=oss"
        target="_blank"
        rel="noreferrer noopener"
      >
        ▲ Powered by Vercel
      </a> */}
    </footer>
  )
}

export default Footer
