import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import getConfig from 'next/config'
const {
  publicRuntimeConfig
} = getConfig()
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
const salt = publicRuntimeConfig.REACT_APP_SECRET_SALT;

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      console.log('loadNFTs data ',i);
      console.log('loadNFTs data token ',i.tokenId);

      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded')
  }

  const hashing = (data) => {
    console.log('data ',data);
    const str = AES.encrypt(JSON.stringify(data), salt);
    return encodeURIComponent(str.toString());
  }

  function detailsNft(nft) {
    const tokenId = hashing(nft.tokenId);
    router.push(`/details-listed-nft?id=${tokenId}`)
  }


  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed by this account</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Explore Your Listed Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-green-900">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  <button className = "mt-4 w-full bg-blue-600 text-white font-bold py-2 px-12 rounded"
                  onClick = {() => detailsNft(nft)} > Details </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
