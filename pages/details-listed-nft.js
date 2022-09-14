import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import Image from 'next/image';
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

export default function DetailsNFT() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({
    transferTo: ''
  })
  const router = useRouter()

  function getParams(param) {
    const dehashing = (data) => {
      const str = decodeURIComponent(data);
      const dehash = AES.decrypt(str, salt).toString(enc.Utf8);
      return dehash;
    }
    const paramData = dehashing(param);
    return paramData;
  }

  const id = getParams(router.query.id);

  useEffect(() => {
    loadNFTsDetails()
  }, [id])

  async function loadNFTsDetails() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListedDetails(id)
    console.log('loadNFTsDetails',data);
    console.log('loadNFTsDetails tokenId ',data.tokenId);

    const tokenUri = await contract.tokenURI(data.tokenId)
    const meta = await axios.get(tokenUri)
    let price = ethers.utils.formatUnits(data.price.toString(), 'ether')
    let item = {
      price,
      tokenId: data.tokenId.toNumber(),
      seller: data.seller,
      owner: data.owner,
      image: meta.data.image,
    }

    setNfts(item)
    setLoadingState('loaded')
  }

  async function transferNFT() {

    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    console.log('formInput transferTo ',formInput.transferTo,' id ',id);
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListedDetails(id)
    console.log('transferNFT',data);
    console.log('transferNFT tokenId ',data.tokenId);

    const isTransferred = await contract.transferItemsListed(formInput.transferTo, data.tokenId)
    console.log('isTransferred ',isTransferred);
  }

  if (loadingState === 'loaded' && !nfts.tokenId) return (<h1 className="py-10 px-20 text-3xl">No Listed Item Details to Show</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Your Listed Item Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            <div className="border shadow rounded-xl overflow-hidden">
              <image src={nfts.image} alt="" className="rounded" />
              <div className="p-4 bg-green-900">
                <p className="text-2xl font-bold text-white">Price - {nfts.price} Eth</p>
                <input placeholder = "Transfer To Address" className = "mt-8 border rounded p-4"
                  required minLength="4" maxLength="100"
                  onChange = {e => updateFormInput({
                      ...formInput,
                      transferTo: e.target.value})}/>
                <button className = "mt-4 w-full bg-blue-600 text-white font-bold py-2 px-12 rounded"
                onClick = {() => transferNFT()} > Transfer </button>
              </div>
              </div>
          }
        </div>
      </div>
    </div>
  )
}
