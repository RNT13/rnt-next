'use client'

import styled from 'styled-components'
import { theme } from '@/styles/theme'

export const FooterContainer = styled.footer`
  background-color: ${theme.colors.primaryColor};
  border-top: 1px solid ${theme.colors.secondaryColor};
  padding: 40px 20px 20px;
  margin-top: auto;
`

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;

  p {
    color: ${theme.colors.textColor};
    font-size: 14px;
    opacity: 0.8;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    gap: 15px;
    
    p {
      font-size: 12px;
    }
  }
`

export const SocialLinks = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  a {
    color: ${theme.colors.textColor};
    transition: all 0.3s ease;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: ${theme.colors.blue2};
      background-color: rgba(30, 144, 255, 0.1);
      transform: translateY(-2px);
    }
  }

  @media (max-width: ${theme.breakpoints.md}) {
    gap: 15px;
    
    a {
      padding: 6px;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
`

