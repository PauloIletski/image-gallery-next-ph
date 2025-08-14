'use client'

import { useState, useEffect } from 'react'
import { 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaWhatsapp,
  FaShareAlt
} from 'react-icons/fa'

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const socialLinks = [
    {
        name: 'Instagram',
        url: 'https://www.instagram.com/issacar.church',
        icon: FaInstagram,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/issacar.church',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700'
    }
    // ,
 
    // {
    //   name: 'YouTube',
    //   url: 'https://www.youtube.com/@issacar.church',
    //   icon: FaYoutube,
    //   color: 'bg-red-600 hover:bg-red-700'
    // // },
    // {
    //   name: 'WhatsApp',
    //   url: 'https://wa.me/5517981048717',
    //   icon: FaWhatsapp,
    //   color: 'bg-green-600 hover:bg-green-700'
    // }
  ]

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Issacar Church - Galeria de Fotos',
          text: 'Confira as fotos dos nossos cultos!',
          url: window.location.href
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  if (isMobile) {
    // Botões flutuantes para mobile
    return (
      <>
        {/* Botões flutuantes */}
            <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-3">
          {/* Botão de compartilhar */}
          <button
            onClick={handleShare}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-lg text-white shadow-lg transition-all hover:bg-white/30 hover:scale-110"
            title="Compartilhar"
          >
            <FaShareAlt className="h-5 w-5" />
          </button>
          
          {/* Botões de redes sociais */}
          {socialLinks.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-12 w-12 items-center justify-center rounded-full ${social.color} text-white shadow-lg transition-all hover:scale-110`}
                title={social.name}
              >
                <Icon className="h-5 w-5" />
              </a>
            )
          })}
        </div>

        {/* Footer fixo no bottom */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg p-4 text-center text-white/80">
          <a href="https://issacar.deco.site" className="hover:text-white font-medium">
            Issacar Church
          </a> 
          <span className="mx-2">•</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </footer>
      </>
    )
  }

  // Footer normal para desktop
  return (
    <footer className="p-6 text-center text-white/80 sm:p-12">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Siga-nos nas redes sociais</h3>
        <div className="flex justify-center gap-4">
          {socialLinks.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-10 w-10 items-center justify-center rounded-full ${social.color} text-white transition-all hover:scale-110`}
                title={social.name}
              >
                <Icon className="h-5 w-5" />
              </a>
            )
          })}
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all hover:scale-110"
            title="Compartilhar"
          >
            <FaShareAlt className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="border-t border-white/20 pt-4">
        <a href="https://issacar.deco.site" className="hover:text-white font-medium">
          Issacar Church
        </a> 
        <span className="mx-2">•</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
