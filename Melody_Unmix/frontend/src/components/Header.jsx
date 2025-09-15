import React from "react";
import logoapp1 from "../assets/images/logoapp-1.png";

const Header = () => {
  return (
    <header className="w-full flex justify-center mt-5">
      <div className="w-[1065px] h-[60px] bg-black rounded-[27px] flex items-center relative">
        <img
          className="w-[45px] h-[37px] ml-8"
          alt="Logoapp"
          src={logoapp1}
        />
        
        <nav className="flex absolute left-1/2 transform -translate-x-1/2">
          <a href="#" className="mx-16 font-mazzard-m text-white text-xl">
            Home
          </a>
          <a href="#" className="mx-16 font-mazzard-m text-white text-xl">
            About
          </a>
          <a href="#" className="mx-16 font-mazzard-m text-white text-xl">
            Sign In/Sign up
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;