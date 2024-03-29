import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import axios from 'axios'
import {useRouter} from 'next/router'
import Image from 'next/image';
import Web3Modal from 'web3modal'
import getConfig from 'next/config'
import {marketplaceAddress} from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
const {publicRuntimeConfig} = getConfig()

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])


  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const networkEndpoint = process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_URL;
    console.log('network endpoint', networkEndpoint);
    const provider = new ethers.providers.JsonRpcProvider(networkEndpoint)
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }

  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length)
  return ( < h1 className = "px-20 py-10 text-3xl" > No Items Listed in the Marketplace < /h1>)
    return (
      <div className = "flex justify-center" >
      <div className = "px-4" style = {{maxWidth: '1600px'}} >
      <h2 className="text-2xl py-2">Discover and Explore Items</h2>
      <h3 className="text-2xl py-2">Showing {nfts.length} results </h3>
      <div className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4" >
      { nfts.map((nft, i) => (
          <div key = {i}className = "border shadow rounded-xl overflow-hidden" >
          <Image src = {nft.image} alt="" width={350} height={300}/>
          <div className = "p-4" >
          <p style = {{height: '64px' }}className = "text-2xl font-semibold" > {nft.name} </p>
          <div style = {{ height: '70px', overflow: 'hidden'}} >
          <p className = "text-gray-400" > { nft.description} </p>
          </div> </div>
          <div className = "p-4 bg-blue-900" >
          <p className = "text-2xl font-bold text-white" > {nft.price} ETH </p>
          <button className = "mt-4 w-full bg-purple-800 text-white font-bold py-2 px-12 rounded"
          onClick = {() => buyNft(nft)} > Buy </button>
          </div>
          </div> )) }
      </div>
      </div>
      </div>
    )
  }
