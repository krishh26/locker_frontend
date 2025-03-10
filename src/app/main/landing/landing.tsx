import React from "react";
import ContentWrapper from "src/app/component/ContentWrapper";
import Footer from "src/app/component/Footer";
import Header from "src/app/component/header";
import MainPageContent from "src/app/component/MainPageContent";
import Navbar from "src/app/component/Navbar";
const landing = () => {
  return (
    <ContentWrapper title="Overview">
      <div>
        {/* <Header data="Landing" /> */}
        <Navbar/>
        <MainPageContent/>
        <Footer/>
      </div>
    </ContentWrapper>
  );
}

export default landing;