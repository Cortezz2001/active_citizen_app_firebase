import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';

export const useNews = () => {
  const { user } = useAuth();
  const { getCollection, getDocument } = useFirestore();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch news based on user's city or global news
  const fetchNews = async () => {
    if (!user) {
      setNews([]);
      setLoading(false);
      setError('No authenticated user');
      return;
    }

    try {
      setLoading(true);
      // Get user's cityKey
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      // Fetch news for user's city
      const cityNewsConditions = [
        { type: 'where', field: 'cityKey', operator: '==', value: cityKey },
      ];
      const cityNews = await getCollection('news', cityNewsConditions);

      // Fetch global news
      const globalNewsConditions = [
        { type: 'where', field: 'isGlobal', operator: '==', value: true },
      ];
      const globalNews = await getCollection('news', globalNewsConditions);

      // Combine and remove duplicates
      const combinedNews = [...cityNews, ...globalNews].reduce((acc, curr) => {
        if (!acc.find((item) => item.id === curr.id)) {
          acc.push(curr);
        }
        return acc;
      }, []);

      // Fetch category names for each news item
      const newsWithCategories = await Promise.all(
        combinedNews.map(async (item) => {
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            const categoryDoc = await getDocument('categories', item.categoryId.id);
            categoryName = categoryDoc?.name || categoryName;
          }
          return { ...item, categoryName };
        })
      );

      setNews(newsWithCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchNews();
  }, [user]);

  return { news, loading, error, fetchNews };
};