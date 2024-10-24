export interface Book {
  id: string;
  title: string;
  authors?: string[];
  image: string;
  addedDate: string;
  startReading?: string;
  readDate?: string;
  rating?: number;
  pagesRead: number;
  pagesTotal: number;
}
