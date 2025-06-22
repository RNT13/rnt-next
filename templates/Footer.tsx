'use client'

import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { FooterContainer, SocialLinks, FooterContent } from './FooterStyles'

const getCurrentYear = () => {
  const date = new Date()
  return date.getFullYear()
}

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <p>&copy; {getCurrentYear()} RNT Projects. All rights reserved.</p>
        <SocialLinks className="social-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub size={24} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram size={24} />
          </a>
        </SocialLinks>
      </FooterContent>
    </FooterContainer>
  )
}

export default Footer

