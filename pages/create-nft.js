import {
  useState
} from 'react'
import {
  ethers
} from 'ethers'
import {
  create as ipfsHttpClient
} from 'ipfs-http-client'
import {
  useRouter
} from 'next/router'

import Web3Modal from 'web3modal'
import getConfig from 'next/config'
const {
  publicRuntimeConfig
} = getConfig()

const projectId = publicRuntimeConfig.REACT_APP_PROJECT_ID;
const secret = publicRuntimeConfig.REACT_APP_API_KEY_SECRET;
const ipfsEndpoint = publicRuntimeConfig.REACT_APP_IPFS_API_ENDPOINT;
const gateway = publicRuntimeConfig.REACT_APP_DEDICATED_GATEWAY;

console.log('projectId ', projectId, ' secret ', secret, ' ipfsEndpoint ', ipfsEndpoint, ' gateway ', gateway);

const auth = 'Basic ' + Buffer.from(projectId + ':' + secret).toString('base64');
console.log('auth ', auth);
const ipsConfig = ((ipfsEndpoint.indexOf('localhost') != -1) ? ({
  url: ipfsEndpoint,
}) : ({
  url: ipfsEndpoint,
  headers: {
    authorization: auth,
  },
}));

console.log('ipsConfig ', ipsConfig);
const client = ipfsHttpClient(ipsConfig);

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  console.log('CreateItem');
  const [fileUrl, setFileUrl] = useState(null)
  const [dataUrl, setDataUrl] = useState(null)
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
    asset_origin: '',
    asset_material: '',
  })
  const router = useRouter()

  async function onChange(e) {
    console.log('onChange');
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file, {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `${gateway}/ipfs/${added.path}`
      console.log('url ', url);
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }

    try {
      const added_data = await client.add(JSON.stringify({
        metadata: {
          asset_origin: formInput.asset_origin,
          asset_material: formInput.asset_material
        }
      }));
      const url_data = `${gateway}/ipfs/${added_data.path}`
      console.log('url data ', url_data);
      setDataUrl(url_data)
    } catch (error) {
      console.log('Error uploading data: ', error)
    }

  } //end

  async function uploadToIPFS() {
    console.log('uploadToIPFS');
    const {
      name,
      description,
      price,
      asset_origin,
      asset_material
    } = formInput

    if (!name || !description || !price || !asset_origin || !asset_material || !fileUrl) {
      alert("Please enter all the data and upload a file");
      return null;
    } else {
      /* first, upload to IPFS */
      const data = JSON.stringify({
        name,
        description,
        metadata: dataUrl,
        image: fileUrl
      })
      try {
        const added = await client.add(data)
        const url = `${gateway}/ipfs/${added.path}`
        console.log('url ', url);
        /* after file is uploaded to IPFS, return the URL to use it in the transaction */
        return url
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }

  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    if (url) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      /* next, create the item */
      const price = ethers.utils.parseUnits(formInput.price, 'ether')
      let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()
      let transaction = await contract.createToken(url, price, {
        value: listingPrice
      })
      let marketItem =  await transaction.wait()
      console.log('marketItem ',marketItem);

      router.push('/')
    }

  }

  return ( <div className = "flex justify-center" ><
      div className = "w-1/2 flex flex-col pb-12" >
    <input placeholder = "Asset Name" className = "mt-8 border rounded p-4"
      required minLength="4" maxLength="40"
      onChange = {e => updateFormInput({
          ...formInput,
          name: e.target.value})}/>
    <textarea placeholder = "Asset Description" className = "mt-2 border rounded p-4"
    required minLength="4" maxLength="100"
      onChange = {e => updateFormInput({
          ...formInput,
          description: e.target.value})}/>
    <textarea placeholder = "Asset Origin" className = "mt-2 border rounded p-4"
    required minLength="4" maxLength="100"
      onChange = {e => updateFormInput({
          ...formInput,
          asset_origin: e.target.value })}/>
    <textarea placeholder = "Asset Material" className = "mt-2 border rounded p-4"
    required minLength="4" maxLength="100"
      onChange = {e => updateFormInput({
          ...formInput,
          asset_material: e.target.value})}/>
    <input placeholder = "Asset Price in Eth" className = "mt-2 border rounded p-4"
    required minLength="4" maxLength="100"
      onChange = {e => updateFormInput({
          ...formInput,
          price: e.target.value})}/>
    <input type = "file" name = "Asset" className = "my-4"
    required minLength="1" maxLength="10"
      onChange = {onChange}/>
      {fileUrl && ( <
        img className = "rounded mt-4"
        width = "350"
        src = {fileUrl}/>)}
    <button onClick = {listNFTForSale}
      className = "font-bold mt-4 bg-blue-600 text-white rounded p-4 shadow-lg">
      Create NFT </button> </div> </div>
)
} //end
