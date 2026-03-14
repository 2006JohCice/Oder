import React from 'react';
import "../css/MainContent.css";
import PostFeed from './MainContents/PostFeed';
import Stories from './MainContents/Stories';
import { useRef, useEffect, useState } from "react";
import Slide from './MainContents/slide';
import Products from './MainContents/products';
import SlideSale from './MainContents/slideSale';
import FeaturedProducts from './MainContents/featuredProducts';
import NewProducts from './MainContents/newProducts';

function MainContent() {




  const scrollRef = useRef();
  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };


  const [message, setMessage] = useState("Đang tải...");



  return (
    <div>
      {/* <div className="stories-wrapper">
        <button className="arrow-btn left" onClick={scrollLeft}>
          ❮
        </button>
        <div className="stories-section" ref={scrollRef}>

          {[...Array(18)].map((_, i) => (

            <img src={`https://picsum.photos/id/${i + 1000}/40/40`} alt={`Story ${i + 1}`} className="poster-avatar" />

          ))}

        </div>
        <button className="arrow-btn right" onClick={scrollRight}>
          ❯
        </button>
      </div> */}

      {/* <PostFeed /> */}
      <div className="slide-content">
        <Slide />
        <SlideSale/>
      </div>
      <FeaturedProducts/> 


      <Products />




    </div>


  );
}

export default MainContent;