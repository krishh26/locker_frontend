import ContentWrapper from "src/app/component/ContentWrapper";
import Footer from "src/app/component/Footer";
import MainPageContent from "src/app/component/MainPageContent";
import Navbar from "src/app/component/Navbar";
const landing = () => {
  return (
    <ContentWrapper title="Overview">
      <div>
        <Navbar/>
        <MainPageContent/>
        <Footer/>
      </div>
    </ContentWrapper>
  );
}

export default landing;