import React from 'react'

const Hero: React.FC = () => {
  return (
    <div className="py-12 mb-4 bg-white border-b bg-hero">
      <div className="container px-5 mx-auto max-w-screen-xl">
        <div className="flex items-stretch py-8 w-full text-center sm:py-12 sm:text-left">
          <div className="flex-1 flex-shrink-0 space-y-3">
            <div className="text-2xl font-extrabold text-black sm:text-3xl">
              Welcome to BCharity Baas👋
            </div>
            <div className="leading-7 text-gray-700">
              Next generation group-driven composable, decentralized, and
              permissionless public good industry Web3 built on blockchains.
            </div>
            <div className="text-2xl font-extrabold text-black sm:text-2xl">
              VHR Crypto OnChain Volunteer Hours
            </div>
            <div className="leading-7 text-gray-700">
              Firstever native utility token to track global donation
              transparently spent on volunteerism. --- Forever Love On-Chain!
            </div>
          </div>
          <div className="hidden flex-1 flex-shrink-0 w-full sm:block"></div>
        </div>
      </div>
    </div>
  )
}

export default Hero
