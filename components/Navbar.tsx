// components/Navbar.tsx

import Link from 'next/link'
import Image from 'next/image'
import { FiHome, FiUpload, FiBox, FiShoppingCart } from 'react-icons/fi'

export default function Navbar() {
  return (
    <nav className="bg-bk-red p-4 flex items-center font-flame">
      <div className="flex items-center">
        <Image src="/images/logo.png" alt="Burger King Logo" width={100} height={100} />
        <span className="text-bk-brown text-2xl font-bold ml-1">Gestion des Stocks</span>
      </div>
      <ul className="flex space-x-4 ml-auto">
        <li className="flex items-center hover:text-xl hover:font-semibold">
          <FiHome className="text-bk-brown mr-1" />
          <Link href="/" className="text-bk-brown font-normal">Accueil
          </Link>
        </li>
        <li className="flex items-center hover:text-xl hover:font-semibold">
          <FiUpload className="text-bk-brown mr-1" />
          <Link href="/import" className="text-bk-brown font-normal">Importation
          </Link>
        </li>
        <li className="flex items-center hover:text-xl hover:font-semibold">
          <FiBox className="text-bk-brown mr-1" />
          <Link href="/products" className="text-bk-brown font-normal">Produits
          </Link>
        </li>
        <li className="flex items-center hover:text-xl hover:font-semibold">
          <FiShoppingCart className="text-bk-brown mr-1" />
          <Link href="/orders" className="text-bk-brown font-normal">Commandes
          </Link>
        </li>
      </ul>
    </nav>
  )
}
