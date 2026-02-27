import "./App.css";
import React from "react";
import * as fetchLib from "./fettch-library.js"

function App() {


  // Call fetchListings when the component mounts
  React.useEffect(() => {
    fetchLib.fetchListings({}, 1, 10, {"price": 1});
  }, []);
  return (
    <>
      <div>
        {/* Filters (zip code, sort by) */}
        {/* Sections for each rental site and listings */}
        {/* Each click on a listing will open a new tab */}
      </div>
    </>
  );
}

export default App;
