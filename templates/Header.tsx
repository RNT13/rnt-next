"use client";

import Image from "next/image";
import Link from "next/link";
import { HeaderContainer, Logo, NavItem, NavMenu } from "./HeaderStyles";

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <Image
          src="https://placehold.co/150x50?text=Logo"
          alt="Logo"
          width={150}
          height={50}
        />
      </Logo>
      <NavMenu>
        <NavItem>
          <Link href="/features">Features</Link>
        </NavItem>
        <NavItem>
          <Link href="/pricing">Pricing</Link>
        </NavItem>
        <NavItem>
          <Link href="/blog">Blog</Link>
        </NavItem>
        <NavItem>
          <Link href="/support">Support</Link>
        </NavItem>
      </NavMenu>
    </HeaderContainer>
  );
};

export default Header;
