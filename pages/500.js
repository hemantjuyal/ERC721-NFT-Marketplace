import Link from 'next/link'

export default function Custom500() {
  return <>
    <h1>Error</h1>
    <Link href="/">
      <a>
        Go back home
      </a>
    </Link>
  </>
}
