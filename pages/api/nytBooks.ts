import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

const NYT_API_URL = 'https://api.nytimes.com/svc/books/v3/lists/current/';
const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env.NYT_API_KEY;
  const listType = req.query.listType;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  const fetchBooks = async (
    listType: string,
    retries: number
  ): Promise<any> => {
    try {
      const response = await axios.get(`${NYT_API_URL}${listType}.json`, {
        params: {
          'api-key': apiKey,
        },
      });
      return response.data.results.books;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429 && retries < MAX_RETRIES) {
          const waitTime = BASE_DELAY * Math.pow(2, retries);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return fetchBooks(listType, retries + 1);
        }
        console.error('Error fetching data from NYT API:', error.message);
      } else {
        console.error('Unexpected error fetching data from NYT API:', error);
      }
      throw error;
    }
  };

  try {
    const books = await fetchBooks(listType as string, 0);
    res.status(200).json(books);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      res.status(500).json({
        error: 'Error fetching data from NYT API',
        message: error.message,
      });
    } else {
      res.status(500).json({ error: 'Error fetching data from NYT API' });
    }
  }
}
