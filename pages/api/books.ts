import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req;
  const { searchTerm } = query; 

  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing searchTerm' });
  }

  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: searchTerm,
        key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY, 
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data from Google Books API' });
  }
}
