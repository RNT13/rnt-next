'use client'

import styled from 'styled-components'
import { theme } from '@/styles/theme'

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: ${theme.colors.primaryColor};
  border-bottom: 1px solid ${theme.colors.secondaryColor};
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    gap: 15px;
  }
`

export const Logo = styled.div`
  display: flex;
  align-items: center;
  
  img {
    width: auto;
    height: 40px;
  }
`

export const NavMenu = styled.nav`
  display: flex;
  gap: 30px;
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
`

export const NavItem = styled.div`
  a {
    text-decoration: none;
    color: ${theme.colors.textColor};
    font-weight: 500;
    font-size: 16px;
    transition: color 0.3s ease;
    position: relative;

    &:hover {
      color: ${theme.colors.blue2};
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -5px;
      left: 0;
      background-color: ${theme.colors.blue2};
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }
`

