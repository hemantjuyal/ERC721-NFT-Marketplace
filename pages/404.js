import Link from 'next/link'

export default function Custom404() {
  return <>
    <h1>Not Found</h1>
    <Link href="/">
      <a>
        Go back home
      </a>
    </Link>
  </>
}
