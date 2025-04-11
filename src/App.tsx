import React from 'react';
import './App.css';
import {HashRouter, Route, Routes} from "react-router-dom";
import AboutScreen from "./screens/AboutScreen";
import HomeScreen from "./screens/HomeScreen";
import Navbar from "./components/navbar/Navbar";
import ResearchScreen from "./screens/ResearchScreen";
import MelindaCubeScreen from "./screens/MelindaCubeScreen";

function App() {
  return (
    <div className="App">
      <HashRouter basename={""}>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<HomeScreen />}/>
            <Route path="/about" element={<AboutScreen />}/>
            <Route path="/research" element={<ResearchScreen />}/>
          </Routes>
        </div>
        <Routes>
            <Route path="/melindacube" element={<MelindaCubeScreen />}/>
        </Routes>

      </HashRouter>
    </div>
  );
}

export default App;
