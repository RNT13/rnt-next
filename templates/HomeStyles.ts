'use client'

import styled from 'styled-components'
import { theme } from './theme'

export const MainContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.primaryColor};
`

export const ContentSection = styled.main`
  flex: 1;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`

export const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 80px;

  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    color: ${theme.colors.textColor};
    margin-bottom: 20px;
    background: linear-gradient(135deg, ${theme.colors.blue2}, ${theme.colors.yellow2});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.25rem;
    color: ${theme.colors.gray2};
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    margin-bottom: 60px;
    
    h1 {
      font-size: 2.5rem;
    }
    
    p {
      font-size: 1.1rem;
    }
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`

export const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: ${theme.colors.blue2};
  }

  h3 {
    font-size: 1.5rem;
    color: ${theme.colors.textColor};
    margin-bottom: 15px;
    font-weight: 600;
  }

  p {
    color: ${theme.colors.gray2};
    line-height: 1.6;
    font-size: 1rem;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 30px 20px;
    
    h3 {
      font-size: 1.3rem;
    }
  }
`

