export interface ProfileData {
  imageUrl?: string;
  name?: string;
  city?: string;
  country?: string;
  aboutMe?: string;
  hobbies?: string[];
  booksToRead?: number;
  goals?: string[];
  genres?: string[];
  followers?: string[];
  following?: string[];
  favoriteBooks?: Book[];
  recentUpdates?: Update[];
  currentlyReading?: Book[];
  recentlyRead?: Book[];
}

export interface Book {
  id: string;
  title: string;
  image: string;
  rating: number;
  readDate?: Date;
  pagesRead?: number;
  pagesTotal?: number;
}

export interface Update {
  bookId: string;
  title: string;
  action: string;
  timestamp: Date;
}
