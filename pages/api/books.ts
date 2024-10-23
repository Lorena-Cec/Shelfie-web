// pages/api/books.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req;
  const { searchType, searchTerm } = query;

  if (!searchTerm || !searchType) {
    return res.status(400).json({ error: 'Missing searchType or searchTerm' });
  }

  try {
    let searchQuery = '';
    if (searchType === 'subject') {
      searchQuery = `subject:${searchTerm}`;
    } else if (searchType === 'author') {
      searchQuery = `inauthor:${searchTerm}`;
    } else if (searchType === 'title') {
      searchQuery = `intitle:${searchTerm}`;
    } else {
      return res.status(400).json({ error: 'Invalid searchType' });
    }

    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: searchQuery,
        maxResults: 10,
        orderBy: 'relevance',
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Error fetching data from Google Books API' });
  }
}
