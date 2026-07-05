import "../css/MainContent.css";
import Advertisement from "./MainContents/Advertisement/Advertisement";
import FeaturedProducts from "./MainContents/products/featuredProducts";
import Products from "./MainContents/products/products";
import SearchHero from "./MainContents/search/search";
import UserRewardCard from "./UserRewardCard";
import VerticalAd from "./MainContents/Advertisement/VerticalAd";

function MainContent() {
  return (
    <div className="gp-main-page">
      {/* 3-Column Hero Section */}
      <div className="gp-hero-3col-layout">
        
        {/* Left Sidebar: Reward + Search */}
        <div className="gp-hero-col-left">
          <UserRewardCard />
          <SearchHero />
        </div>

        {/* Center: Banner */}
        <div className="gp-hero-col-center">
          <Advertisement />
        </div>

        {/* Right Sidebar: Vertical Ad */}
        <div className="gp-hero-col-right">
          <VerticalAd />
        </div>

      </div>
      
      {/* Products Section */}
      <Products />
    </div>
  );
}

export default MainContent;
