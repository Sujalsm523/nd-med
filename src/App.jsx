import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Loader from "./components/Loader";
import Wp from "./components/Wp";
import Bckend from "./components/Backend";

const userPrefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [startLoadProgress, setStartLoadProgress] = useState(false);

  // useEffect(() => {
  //   if (userPrefersDark) document.body.classList.add("dark-theme");
  //   stopLoad();
  // }, []);

  // const stopLoad = () => {
  //   setStartLoadProgress(true);
  //   setTimeout(() => setAppLoaded(true), 3000);
  // };

  // if (!appLoaded) return <Loader done={startLoadProgress} />;

  return (
    <div className="app">
      <p className="app__mobile-message"> Only available on desktop 😊. </p>
      {/* <Router>
        <div className="app-content">
          {/* <Sidebar /> */}
      {/* <Switch> 
          {/*  
          <Route component={Wp} />
          <Route path="/" component={Wp} />
          {/* </Switch> 
        </div>
      </Router> */}
      <Router>
        <Routes>
          <Route path="/" element={<Wp />} />
          <Route path="/bca" element={<Bckend />} />
        </Routes>
      </Router>
      {/* <Wp /> */}
    </div>
  );
}

export default App;
