import {Talk} from "../../data/Papers";
import "./PaperItem.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileArrowDown} from "@fortawesome/free-solid-svg-icons/faFileArrowDown";


interface TalkItemProps extends Talk {
  fullWidth?: boolean
}

const TalkItem = ({name, date, conference, location, fileName, fullWidth = false}: TalkItemProps) => {

  return (
    <div className="paper" style={fullWidth ? {width: "100%"} : {}}>
      <div className="paper-card">
        <div className="image-container">
          <img className="paper-page" src={`/talks/${fileName}.png`} alt={fileName}/>
        </div>
        <div className="paper-detail">
          <div>
            <h3 style={{marginTop: 0 }}>{name}</h3>
            <h4 style={{fontWeight: "normal"}}>At <i>{conference}</i>; {location}; {date.toLocaleDateString()}</h4>
          </div>
          <div className="buttons-container">
            <a href={`/talks/${fileName}.pdf`} target="_blank" rel="noreferrer" className="paper-button download-button">
              <FontAwesomeIcon icon={faFileArrowDown} style={{marginRight: "0.75rem"}}/>
              Open PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TalkItem