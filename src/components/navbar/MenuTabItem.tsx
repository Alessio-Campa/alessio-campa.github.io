import {Link} from "react-router-dom";
import {ReactNode} from "react";

interface MenuItemProps {
  children: ReactNode;
  href: string;
  isActive?: boolean;
}

const MenuTabItem = ({children, href, isActive = false}: MenuItemProps) => {
  return (
    <div className={`menu-tab-item ${isActive ? "active" : ""}`}>
      <Link className="navbar-item" to={href}>
        {children}
      </Link>
    </div>
  )
}

export default MenuTabItem