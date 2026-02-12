
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  answer: string;
  sources: GroundingSource[];
  query: string;
  timestamp: Date;
}

export enum SearchFocus {
  GENERAL = 'General',
  NEWS = 'Latest News',
  ACADEMIC = 'Academic & Research',
  TECHNICAL = 'Technical & Coding'
}
