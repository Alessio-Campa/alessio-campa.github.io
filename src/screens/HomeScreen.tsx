import {useEffect} from "react";
import PaperItem from "../components/researches/PaperItem";
import {papers, talks} from "../data/Papers";
import TalkItem from "../components/researches/TalkItem";
import Links from "../components/links/Links";

import "./HomeScreen.css"
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleRight} from "@fortawesome/free-solid-svg-icons";


const HomeScreen = () => {
  const latestPaper = papers.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
  const latestTalk = talks.sort((a, b) => b.date.getTime() - a.date.getTime())[0]

  useEffect(() => {
    document.title = "Alessio Campanelli"
  }, []);

  return (
    <>
      <h1>Hi! I'm Alessio Campanelli.</h1>
      <p>PhD Student @ <a href="https://www.unive.it/pag/13526" target="_blank" rel="noreferrer">Ca' Foscari University of Venice</a></p>
      <div id="latest-container">
        <div>
          <div className="latest-title-container">
            <h2>Latest Paper</h2>
            <Link to={"/research"}> All papers <FontAwesomeIcon icon={faAngleRight} /> </Link>
          </div>
          <PaperItem {...latestPaper} fullWidth/>
        </div>
        <div>
          <div className="latest-title-container">
            <h2>Latest Talk</h2>
            <Link to={"/research"}> All talks <FontAwesomeIcon icon={faAngleRight} /> </Link>
          </div>
          <TalkItem {...latestTalk} fullWidth/>
        </div>
      </div>
      <div>
        <h2>My Links</h2>
        <Links/>
      </div>
    </>
  )
}

export default HomeScreen