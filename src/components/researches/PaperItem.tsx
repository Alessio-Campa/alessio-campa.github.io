import {Paper} from "../../data/Papers";
import "./PaperItem.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare";
import {faFileArrowDown} from "@fortawesome/free-solid-svg-icons/faFileArrowDown";


interface PaperItemProps extends Paper {
  fullWidth?: boolean;
}

const PaperItem = ({name, authors, date, publication, fileName, doi, fullWidth = false}: PaperItemProps) => {

  return (
    <div className="paper" style={fullWidth ? {width: "100%"} : {}}>
      <div className="paper-card">
        <div className="image-container">
          <img className="paper-page" src={`/papers/${fileName}.png`} alt={fileName}/>
        </div>
        <div className="paper-detail">
          <div>
            <h3 style={{marginTop: 0 }}>{name}</h3>
            <h4>Authors:{" "}
              {authors.map((name, i) =>
                <span
                  style={{fontWeight: "normal"}}
                >
                  <span style={{textDecoration: name === "Alessio Campanelli" ? "underline" : "normal"}}>
                    {name}
                  </span>
                  {i !== authors.length -1 ? ", " : ""}
                </span>
              )}
            </h4>
            <h4 style={{fontWeight: "normal"}}>In <i>{publication}</i>, {date.getFullYear()}</h4>
          </div>
          <div className="buttons-container">
            {doi &&
            <a href={`https://doi.org/${doi}`} target="_blank" rel="noreferrer" className="paper-button open-button">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{marginRight: "0.75rem"}}/>
              DOI
            </a>
            }
            <a href={`/papers/${fileName}.pdf`} target="_blank" rel="noreferrer" className="paper-button download-button">
              <FontAwesomeIcon icon={faFileArrowDown} style={{marginRight: "0.75rem"}}/>
              Open PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaperItem