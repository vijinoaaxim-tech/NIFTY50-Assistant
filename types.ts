export interface Source {
  uri: string;
  title: string;
}

export interface AnalysisReport {
  text: string;
  sources: Source[];
}