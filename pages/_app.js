/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6 font-semibold ">
        <p className="text-4xl font-bold text-purple-800"> NFT Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-purple-800">
              Explore NFTs
            </a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-purple-800">
              Create & Sell NFTs
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-purple-800">
              My NFTs
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-purple-800">
              My Listed NFTs
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
