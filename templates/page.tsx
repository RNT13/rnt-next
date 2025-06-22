'use client'

import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'
import { MainContainer, ContentSection, HeroSection, FeatureGrid, FeatureCard } from '@/styles/HomeStyles'

export default function Home() {
  return (
    <MainContainer>
      <Header />
      
      <ContentSection>
        <HeroSection>
          <h1>Bem-vindo ao RNT Next</h1>
          <p>Uma aplicação Next.js moderna com configurações pré-definidas</p>
        </HeroSection>

        <FeatureGrid>
          <FeatureCard>
            <h3>⚡ Performance</h3>
            <p>Otimizado para velocidade e eficiência</p>
          </FeatureCard>
          <FeatureCard>
            <h3>🎨 Design Moderno</h3>
            <p>Interface limpa e responsiva</p>
          </FeatureCard>
          <FeatureCard>
            <h3>🔧 Configurado</h3>
            <p>Tudo pronto para desenvolvimento</p>
          </FeatureCard>
        </FeatureGrid>
      </ContentSection>

      <Footer />
    </MainContainer>
  )
}

