import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComputer} from "@fortawesome/free-solid-svg-icons";
import Markdown from "react-markdown";

interface WorkExperienceItemProps {
  name: string;
  location: string;
  start: Date;
  end?: Date;
  description?: string;
}

const WorkExperienceItem = ({name, location, start, end, description}: WorkExperienceItemProps) => {
  const getEndYear = (): string => {
    if (end == null) return "In Progress";
    return "" + end.getFullYear();
  }

  return(
    <div className="card">
      <div className="icon">
        <h2>
          <FontAwesomeIcon icon={faComputer} />
        </h2>
      </div>
      <div>
        <h2 style={{marginBottom: "0.5rem"}}>{name}</h2>
        <h4 style={{marginTop: 0, marginBottom: "0.5rem"}}>{location}</h4>
        <p> {start.getFullYear()} - {getEndYear()}</p>
        <Markdown>{description}</Markdown>
      </div>
    </div>
  )
}

export default WorkExperienceItem;