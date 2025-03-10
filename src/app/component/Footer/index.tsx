import React from "react";
import Style from "./style.module.css";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <div>
      <div>
        <div className="flex flex-col justify-evenly relative py-48 bg-[#6D81A3] text-white sm:flex-row">
          <div className="bottom-0 left-0 absolute z-20">
            <img
              src="assets/images/svgImage/bg-design4.svg"
              alt="img1"
              className="h-full"
            />
          </div>

          <div className="absolute top-0 right-0 " >
            <img
              src="assets/images/svgImage/bg-design5.svg"
              alt="img1"
            />
          </div>

          <div className="flex flex-col items-start w-full mb-8 sm:w-1/3">
            <img
              src="assets/images/logo/logo-text.svg"
              alt="Logo"
              className="w-2/5"
            />

            <p className="hidden text-justify text-13 sm:block">
              Your next-generation e-portfolio solution for efficient skills and knowledge assessment, replacing traditional paper portfolios. Empower educators with dynamic progress monitoring tools and engaging resources to optimize learning outcomes. Designed for compliance with Ofsted and ESFA standards, Locker offers real-time skills assessment and user-friendly features for all stakeholders. Created by industry experts, Locker revolutionizes the educational landscape with intuitive functionality and robust IQA capabilities.
            </p>

          </div>
          <div className="flex justify-around text-12 sm:text-14 sm:justify-between sm:w-1/3">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className={Style.footerMenu}>
                <li>
                  <a href="#">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#">
                    Why Locker
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Policy</h3>
              <ul className={Style.footerMenu}>
                <li>
                  <a href="#">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#">
                    Need Help?
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Follow Us On</h3>
              <div className={Style.footerMenu}>
                <div className="flex flex-row items-center gap-8 ">
                  <div>
                    <FacebookIcon />
                  </div>
                  <a href="#" className="text-white mr-2">
                    Facebook
                  </a>
                </div>
                <div className="flex flex-row items-center gap-8 ">
                  <div>
                    <InstagramIcon />
                  </div>
                  <a href="#" className="text-white mr-2">
                    Instagram
                  </a>
                </div>
                <div className="flex flex-row items-center gap-8 ">
                  <div>
                    <TwitterIcon />
                  </div>
                  <a href="#" className="text-white">
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${Style.footer} w-full flex h-48 justify-center absolute items-center bg-[#526380] z-10`}>
        <p>Copyright &#169; 2024 Locker. All right reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
