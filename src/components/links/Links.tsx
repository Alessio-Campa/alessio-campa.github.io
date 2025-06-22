import "./Links.css"
import {IconDefinition} from "@fortawesome/free-regular-svg-icons";
import {faGithub, faLinkedin, faTwitter, faXTwitter} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";

interface LinkItemProps {
  url: string;
  icon: IconDefinition;
  backgroundColor: string;
  title: string
}

const LinkItem = ({url, icon, backgroundColor, title}: LinkItemProps) => {
  const [isOver, setIsOver] = useState(false);
  if (url === "https://x.com/AlessioCampa_") {
    return (
      <div>
        <div style={{width: '100%', display: "flex", justifyContent: "center"}}>
          <a
            id="twitter-bubble"
            className="link-bubble"
            style={{
              backgroundColor: !isOver ? backgroundColor : "#1DA1F2",
            }}
            href={url}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setIsOver(true)}
            onMouseLeave={() => setIsOver(false)}
            title={title}
          >
            <h1>
              {!isOver ?
                <FontAwesomeIcon icon={icon}/>
                :
                <FontAwesomeIcon icon={faTwitter}/>
              }
            </h1>
          </a>
        </div>
        {!isOver ?
          <h6 style={{textAlign: "center", marginTop: 4}}>X</h6>
          :
          <h6 style={{textAlign: "center", marginTop: 4}}>Twitter</h6>

        }
      </div>
    )
  }
  return (
    <div>
      <div style={{width:'100%', display:"flex", justifyContent:"center"}}>
        <a
          className="link-bubble"
          style={{backgroundColor}}
          href={url}
          target="_blank"
          rel="noreferrer"
          title={title}
        >
          <h1>
            <FontAwesomeIcon icon={icon}/>
          </h1>
        </a>
      </div>

      <h6 style={{textAlign: "center", marginTop: 4}}>{title}</h6>
    </div>
  )
}

const links: LinkItemProps[] = [
  {
    url: "https://github.com/Alessio-Campa",
    icon: faGithub,
    backgroundColor: "#000000",
    title: "GitHub",
  },
  {
    url: "https://www.linkedin.com/in/alessio-campanelli-67788b174/",
    icon: faLinkedin,
    backgroundColor: "#0072b1",
    title: "Linkedin",
  },
  {
    url: "https://x.com/AlessioCampa_",
    icon: faXTwitter,
    backgroundColor: "#000000",
    title: "X"
  },
  {
    url: "https://www.unive.it/data/persone/28847327",
    icon: faUser,
    backgroundColor: "#9e1f36",
    title: "Unive"
  },
]

const Links = () => {

  return (
    <div id="links-container">
      {links.map(link => (
        <LinkItem {...link} />
      ))}
    </div>
  )
}


export default Links;