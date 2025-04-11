import "./Navbar.css"
import NavbarItem from "./NavbarItem";
import {Link, useLocation} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import MenuTabItem from "./MenuTabItem";
import {useEffect, useState} from "react";

const Navbar = () => {
  const {pathname} = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = () => {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (isMenuOpen){
      setTimeout(() => {
          document.addEventListener('click', handleClick)
        }, 1
      )
    }


    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [isMenuOpen]);

  const tabs = [{
      name: "Home",
      href: "/",
    }, {
      name: "About",
      href: "/about",
    }, {
      name: "Research",
      href: "/research",
    },
  ]

  return (
    <div id="navbar">
      <Link to="/">
        <h1 id="name">Alessio <span style={{paddingLeft: "0.5rem", fontWeight: "lighter"}}>Campanelli</span></h1>
      </Link>
      <div id="menu-tab" className={isMenuOpen ? "open" : ""}>
        {tabs.map(({name, href}) => (
          <MenuTabItem key={name} href={href} isActive={pathname === href}>
            {name}
          </MenuTabItem>
          )
        )}
      </div>
      {tabs.reverse().map(({name, href}) => (
          <NavbarItem key={name} href={href} isActive={pathname === href}>
            {name}
          </NavbarItem>
        )
      )}
      <div className="menu">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FontAwesomeIcon icon={faBars} color={"white"}/>
        </button>
      </div>
    </div>
  )
}

export default Navbar