import React, { useState, useEffect, useRef, useCallback } from 'react';

import Loading from '../../helps/Loading';

const ALL_POSTS = [
    {
        id: 1,
        authorName: "Quán ăn mỗi tuần",
        authorAvatar: "https://tse2.mm.bing.net/th/id/OIP.2BEj5M4qw92WlkoSWqZ_FAHaE7?pid=Api&P=0&h=220",
        content: "Một đoạn văn nào đó ở đây\nhahah món ngon mỗi ngày",
        images: [
            "https://tse2.mm.bing.net/th/id/OIP.2BEj5M4qw92WlkoSWqZ_FAHaE7?pid=Api&P=0&h=220",
            "https://tse2.mm.bing.net/th/id/OIP.2BEj5M4qw92WlkoSWqZ_FAHaE7?pid=Api&P=0&h=220",
            "https://tse2.mm.bing.net/th/id/OIP.2BEj5M4qw92WlkoSWqZ_FAHaE7?pid=Api&P=0&h=220",
            "https://tse2.mm.bing.net/th/id/OIP.2BEj5M4qw92WlkoSWqZ_FAHaE7?pid=Api&P=0&h=220",
        ]
    },
    {
        id: 2,
        authorName: "Nhà Hàng A",
        authorAvatar: "https://picsum.photos/id/1027/40/40",
        content: "Bữa trưa tuyệt vời tại một nhà hàng ấm cúng.\nKhông gian yên tĩnh, đồ ăn rất ngon!",
        images: [
            "https://picsum.photos/id/1060/500/300",
            "https://picsum.photos/id/1059/500/300",
            "https://picsum.photos/id/1058/500/300",
            "https://picsum.photos/id/1057/500/300",
        ]
    },
    {
        id: 3,
        authorName: "Quán Ăn B",
        authorAvatar: "https://picsum.photos/id/1012/40/40",
        content: "Đặc sản lẩu nướng không thể bỏ qua.\nRủ ngay hội bạn thân thôi nào!",
        images: [
            "https://picsum.photos/id/212/500/300",
            "https://picsum.photos/id/225/500/300",
            "https://picsum.photos/id/234/500/300",
            "https://picsum.photos/id/237/500/300",
        ]
    },
    {
        id: 4,
        authorName: "Cà Phê C",
        authorAvatar: "https://picsum.photos/id/201/40/40",
        content: "Một góc nhỏ để thư giãn cuối tuần.\nCà phê và bánh ngọt ở đây là số một.",
        images: [
            "https://picsum.photos/id/305/500/300",
            "https://picsum.photos/id/319/500/300",
            "https://picsum.photos/id/326/500/300",
            "https://picsum.photos/id/338/500/300",
        ]
    },
    {
        id: 5,
        authorName: "Buffet D",
        authorAvatar: "https://picsum.photos/id/342/40/40",
        content: "Tiệc buffet hải sản tươi sống.\nĂn không giới hạn, no căng bụng.",
        images: [
            "https://picsum.photos/id/366/500/300",
            "https://picsum.photos/id/375/500/300",
            "https://picsum.photos/id/382/500/300",
            "https://picsum.photos/id/390/500/300",
        ]
    },
    {
        id: 6,
        authorName: "Đồ Ăn Vặt E",
        authorAvatar: "https://picsum.photos/id/431/40/40",
        content: "Team mê đồ ăn vặt bơi hết vào đây.\nNgon, bổ, rẻ là có thật!",
        images: [
            "https://picsum.photos/id/433/500/300",
            "https://picsum.photos/id/445/500/300",
            "https://picsum.photos/id/450/500/300",
            "https://picsum.photos/id/453/500/300",
        ]
    },
    {
        id: 7,
        authorName: "Nhà Hàng Chay F",
        authorAvatar: "https://picsum.photos/id/455/40/40",
        content: "Ăn chay thanh tịnh, tốt cho sức khỏe.\nCác món chay được chế biến rất tinh tế.",
        images: [
            "https://picsum.photos/id/488/500/300",
            "https://picsum.photos/id/490/500/300",
            "https://picsum.photos/id/499/500/300",
            "https://picsum.photos/id/506/500/300",
        ]
    },
    {
        id: 8,
        authorName: "Quán Nhậu G",
        authorAvatar: "https://picsum.photos/id/531/40/40",
        content: "Mồi bén, bia lạnh, cuối tuần lên!\nĐịa điểm tụ tập lý tưởng.",
        images: [
            "https://picsum.photos/id/547/500/300",
            "https://picsum.photos/id/553/500/300",
            "https://picsum.photos/id/555/500/300",
            "https://picsum.photos/id/569/500/300",
        ]
    },
    {
        id: 9,
        authorName: "Nhà Hàng Nhật H",
        authorAvatar: "https://picsum.photos/id/615/40/40",
        content: "Trải nghiệm ẩm thực Nhật Bản.\nSushi và sashimi tươi ngon hảo hạng.",
        images: [
            "https://picsum.photos/id/628/500/300",
            "https://picsum.photos/id/646/500/300",
            "https://picsum.photos/id/659/500/300",
            "https://picsum.photos/id/669/500/300",
        ]
    },
    {
        id: 10,
        authorName: "Pizza I",
        authorAvatar: "https://picsum.photos/id/684/40/40",
        content: "Tín đồ của pizza không thể làm ngơ.\nĐế bánh giòn rụm, phô mai kéo sợi.",
        images: [
            "https://picsum.photos/id/718/500/300",
            "https://picsum.photos/id/738/500/300",
            "https://picsum.photos/id/768/500/300",
            "https://picsum.photos/id/776/500/300",
        ]
    },
    {
        id: 11,
        authorName: "Đồ Ăn Hàn Quốc K",
        authorAvatar: "https://picsum.photos/id/822/40/40",
        content: "Chuẩn vị Hàn, cay xé lưỡi.\nTokbokki, mì cay, gà rán...",
        images: [
            "https://picsum.photos/id/835/500/300",
            "https://picsum.photos/id/837/500/300",
            "https://picsum.photos/id/838/500/300",
            "https://picsum.photos/id/844/500/300",
        ]
    }
];

function PostFeed(){

    // const [videos, setVideos] = useState([]);
    // const [page, setPage] = useState(0);
    // const [isLoading, setIsLoading] = useState(false);
    // const [hasMore, setHasMore] = useState(true);
  
    // const fetchVideos = useCallback(async () => {
      
    //     if (isLoading || !hasMore) return;
    //         setIsLoading(true);
    //         // Giả lập gọi API với timeout
    //         setTimeout(() => {
    //             const newVideos = ALL_POSTS.slice(page * 2, (page + 1) * 2); // Lấy 3 video mỗi trang
    //             setVideos((prev) => [...prev, ...newVideos]);
    //             setPage((prev) => prev + 1);
    //             setIsLoading(false);
    //             if (newVideos.length === 0) setHasMore(false); // Không còn video để tải
    //         }, 1000);


    // }, [page, isLoading, hasMore]);
  
    // useEffect(() => {
    //     fetchVideos();
    // }, []); // Chỉ gọi lần đầu
  
    // const observer = useRef();
    // const lastVideoElementRef = useCallback((node) => {
    //     if (isLoading) return;
    //     if (observer.current) observer.current.disconnect();
    //     observer.current = new IntersectionObserver((entries) => {
    //         if (entries[0].isIntersecting && hasMore) {
    //             fetchVideos();
    //         }
    //     });
    //     if (node) observer.current.observe(node);
    // }, [isLoading, hasMore, fetchVideos]);

    // return(
    // <>
    // {videos.map((post, index) => {
    //     if (videos.length === index + 1) {
    //         return (
    //             <div ref={lastVideoElementRef} key={post.id} className="post-card">
    //                 <div className="post-header">
    //                     <div className="poster-avatar">
    //                         <img src={post.authorAvatar} alt="Avatar" className="poster-avatar" />
    //                     </div>
    //                     <div className="poster-info">
    //                         <p className="poster-name">{post.authorName}</p>
    //                     </div>
    //                     <div className="post-actions">
    //                         <button className="follow-btn">Follow</button>
    //                         <button className="chat-btn">Chat</button>
    //                     </div>
    //                 </div>
    //                 <div className="post-body">
    //                     {post.content.split('\n').map((line, idx) => (
    //                         <p key={idx}>{line}</p>
    //                     ))}
    //                 </div>
    //                 <div id={`carouselExampleIndicators${post.id}`} className="carousel slide photo-grid" data-bs-ride="carousel">
    //                     {post.images.map((img, imgIdx) => (
    //                         <img key={imgIdx} src={img} alt={`Post image ${imgIdx + 1}`} />
    //                     ))}
    //                 </div>
    //             </div>
    //         );
    //     } else {
    //         return (
    //             <div key={post.id} className="post-card">
    //                 <div className="post-header">
    //                     <div className="poster-avatar">
    //                         <img src={post.authorAvatar} alt="Avatar" className="poster-avatar" />
    //                     </div>
    //                     <div className="poster-info">
    //                         <p className="poster-name">{post.authorName}</p>
    //                     </div>
    //                     <div className="post-actions">
    //                         <button className="follow-btn">Follow</button>
    //                         <button className="chat-btn">Chat</button>
    //                     </div>
    //                 </div>
    //                 <div className="post-body">
    //                     {post.content.split('\n').map((line, idx) => (
    //                         <p key={idx}>{line}</p>
    //                     ))}
    //                 </div>
    //                 <div id={`carouselExampleIndicators${post.id}`} className="carousel slide photo-grid" data-bs-ride="carousel">
    //                     {post.images.map((img, imgIdx) => (
    //                         <img key={imgIdx}
    //                             src={img}
    //                             alt={`Post image ${imgIdx + 1}`}
    //                         />
    //                     ))}
    //                 </div>
    //             </div>
    //         );
    //     }
    // })}
    // {isLoading && <p><Loading/></p>}
    // {!hasMore && <p>Hết Kết Qủa Cho Khu Vực Của Bạn</p>}

    
    // </>)

    const scrollRef = useRef();
    const scrollRight = () => {
        scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    };
    const scrollLeft = () => {
        scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    };

        return(
    <>
        {ALL_POSTS && ALL_POSTS.length > 0 ? (
        <div className="mainContent"  ref={scrollRef}>

             <button className="arrow-btn left" onClick={scrollLeft}>
                ❮
            </button>
            <div>
           
           
            {ALL_POSTS.map((post, index) => (
                 
            <div key={index} className="card" >
                <img
                src="https://tse2.mm.bing.net/th/id/OIP.2BEj5M4qw92WlkoSWqZ_FAHaE7?pid=Api&P=0&h=220"
                className="card-img-top"
                alt="..."
                />
                <div className="card-body">
                <h5 className="card-title">Món Lẩu Cay</h5>
                <p className="card-text">Món lẩu thơm ngon tại nhà hàng theo phong các hiện đại nhưng vẫn mang tầm cổ điển</p>
                <a href="#" className="btn btn-primary">Đọc Thêm</a>
                </div>
            </div>
             
            ))}
          
            </div>

            <button className="arrow-btn right" onClick={scrollRight}>
                ❯
            </button>
        </div>
        ): (
        <div className="mainContent">
            <div className="card" aria-hidden="true">
                <div className="loadingImg">
                    <p className="placeholder-glow">
                    <span className="placeholder col-12"></span>
                    </p>
                </div>
                <div className="card-body">
                    <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                    <span className="placeholder col-12"></span>
                    <span className="placeholder col-2"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                    </p>
                    <a
                    href="#"
                    tabIndex={-1}
                    className="btn btn-primary disabled placeholder col-6"
                    ></a>
                </div>
            </div>

            <div className="card" aria-hidden="true">
                <div className="loadingImg">
                    <p className="placeholder-glow">
                    <span className="placeholder col-12"></span>
                    </p>
                </div>
                <div className="card-body">
                    <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                    <span className="placeholder col-12"></span>
                    <span className="placeholder col-2"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                    </p>
                    <a
                    href="#"
                    tabIndex={-1}
                    className="btn btn-primary disabled placeholder col-6"
                    ></a>
                </div>
            </div>

            <div className="card" aria-hidden="true">
                <div className="loadingImg">
                    <p className="placeholder-glow">
                    <span className="placeholder col-12"></span>
                    </p>
                </div>
                <div className="card-body">
                    <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                    <span className="placeholder col-12"></span>
                    <span className="placeholder col-2"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                    </p>
                    <a
                    href="#"
                    tabIndex={-1}
                    className="btn btn-primary disabled placeholder col-6"
                    ></a>
                </div>
            </div>

            <div className="card" aria-hidden="true">
                <div className="loadingImg">
                    <p className="placeholder-glow">
                    <span className="placeholder col-12"></span>
                    </p>
                </div>
                <div className="card-body">
                    <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                    <span className="placeholder col-12"></span>
                    <span className="placeholder col-2"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                    </p>
                    <a
                    href="#"
                    tabIndex={-1}
                    className="btn btn-primary disabled placeholder col-6"
                    ></a>
                </div>
            </div>
        </div>




  
        )}




{/*    
        <div className='mainContent'>
            <div className="card" aria-hidden="true">
                    <div className='loadingImg'>
                       <p className=" placeholder-glow  ">

                            <span className="placeholder col-12"></span>
                           
                        </p>    
                    </div>
                 
                    
                    <div className="card-body">
                        <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </h5>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-12"></span>
                            <span className="placeholder col-2"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                        <a
                            href="#"
                            tabIndex={-1}
                            className="btn btn-primary disabled placeholder col-6"
                        ></a>
                    </div>
            </div>

             <div className="card" aria-hidden="true">
                     <div className='loadingImg'>
                       <p className=" placeholder-glow  ">

                            <span className="placeholder col-12"></span>
                           
                        </p>    
                    </div>
                    
                    <div className="card-body">
                        <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </h5>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-12"></span>
                            <span className="placeholder col-2"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                        <a
                            href="#"
                            tabIndex={-1}
                            className="btn btn-primary disabled placeholder col-6"
                        ></a>
                    </div>
            </div>

            <div className="card" aria-hidden="true">
                     <div className='loadingImg'>
                       <p className=" placeholder-glow  ">

                            <span className="placeholder col-12"></span>
                           
                        </p>    
                    </div>
                    
                    <div className="card-body">
                        <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </h5>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-12"></span>
                            <span className="placeholder col-2"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                        <a
                            href="#"
                            tabIndex={-1}
                            className="btn btn-primary disabled placeholder col-6"
                        ></a>
                    </div>
            </div>

            <div className="card" aria-hidden="true">
                     <div className='loadingImg'>
                       <p className=" placeholder-glow  ">

                            <span className="placeholder col-12"></span>
                           
                        </p>    
                    </div>
                    
                    <div className="card-body">
                        <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </h5>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-12"></span>
                            <span className="placeholder col-2"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                        <a
                            href="#"
                            tabIndex={-1}
                            className="btn btn-primary disabled placeholder col-6"
                        ></a>
                    </div>
            </div>

            <div className="card" aria-hidden="true">
                     <div className='loadingImg'>
                       <p className=" placeholder-glow  ">

                            <span className="placeholder col-12"></span>
                           
                        </p>    
                    </div>
                    
                    <div className="card-body">
                        <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </h5>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-12"></span>
                            <span className="placeholder col-2"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                        <a
                            href="#"
                            tabIndex={-1}
                            className="btn btn-primary disabled placeholder col-6"
                        ></a>
                    </div>
            </div>

        </div> */}



    </>

        )


}

export default PostFeed;