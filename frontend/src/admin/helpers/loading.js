// Loading.js

function Loading({message}) {
  return (
      <div className="loading-container" style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px"}}>
         <div class="spinner spinner-grow text-primary loading-container" role="status">

         </div>
            <p style={{color: "aliceblue", fontSize: "2.2rem"}}>{message}</p>    
      </div>
  );
}

export default Loading;
