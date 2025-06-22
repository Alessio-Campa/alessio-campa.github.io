interface Paper {
  name: string;
  authors: string[];
  date: Date;
  publication: string;
  fileName: string;
  doi?: string;
}

interface Talk {
  name: string;
  conference: string;
  location: string;
  date: Date;
  fileName: string;
}

const papers: Paper[] = [
  {
    name: "Where the patterns are: repetition-aware compression for colored de Bruijn graphs",
    authors: ["Alessio Campanelli", "Giulio Ermanno Pibiri", "Jason Fan", "Rob Patro"],
    date: new Date(2024, 9),
    publication: "Journal of Computational Biology",
    fileName: "JCB_24",
    doi: "10.1089/cmb.2024.0714"
  }
  ,{
    name: "Fast pseudoalignment queries on compressed colored de Bruijn graphs",
    authors: ["Alessio Campanelli", "Giulio Ermanno Pibiri", "Rob Patro"],
    date: new Date(2025, 8),
    publication: "25th International Workshop on Algorithms in Bioinformatics",
    fileName: "WABI_25",
    // doi: "10.1089/cmb.2024.0714"
  },
]

const talks: Talk[] = [
  {
    name: "Where the patterns are: repetition-aware compression for colored de Bruijn graphs",
    conference: "WCTA 2024",
    location: "Puerto Vallarta, Jalisco, Mexico",
    date: new Date(2024, 8, 26),
    fileName: "WCTA_24",
  },
]

export type {Paper, Talk}
export {papers, talks}