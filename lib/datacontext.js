import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, hasProfile } = useAuth();
  const { getCollection, getDocument } = useFirestore();

  // Состояния для новостей
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Состояния для событий
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Состояния для опросов
  const [surveys, setSurveys] = useState([]);
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [surveysError, setSurveysError] = useState(null);

  // Состояния для петиций
  const [petitions, setPetitions] = useState([]);
  const [petitionsLoading, setPetitionsLoading] = useState(true);
  const [petitionsError, setPetitionsError] = useState(null);

  // Универсальная функция для загрузки данных
  const fetchData = async (collectionName, setData, setLoading, setError, conditions = []) => {
    if (!user || hasProfile === false) {
      setData([]);
      setLoading(false);
      setError('No authenticated user');
      return;
    }

    try {
      setLoading(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      // Условия для фильтрации по городу
      const defaultConditions = [
        { type: 'where', field: 'cityKey', operator: '==', value: cityKey },
      ];
      const finalConditions = conditions.length > 0 ? conditions : defaultConditions;

      // Загрузка данных
      const data = await getCollection(collectionName, finalConditions);

      // Для новостей: добавляем категории и комментарии
      if (collectionName === 'news') {
        const dataWithCategoriesAndComments = await Promise.all(
          data.map(async (item) => {
            // Получаем категорию
            let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
            if (item.categoryId) {
              const categoryDoc = await getDocument('categories', item.categoryId.id);
              categoryName = categoryDoc?.name || categoryName;
            }
            
            // Получаем количество комментариев
            const commentConditions = [
              { type: 'where', field: 'parentCollection', operator: '==', value: 'news' },
              { type: 'where', field: 'parentId', operator: '==', value: `news/${item.id}` },
            ];
            const comments = await getCollection('comments', commentConditions);
            const commentCount = comments.length;
            
            return { ...item, categoryName, commentCount };
          })
        );
        setData(dataWithCategoriesAndComments);
      } else {
        setData(data);
      }

      setError(null);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка новостей
  const fetchNews = async () => {
    if (!user && hasProfile === false) {
      setNews([]);
      setNewsLoading(false);
      setNewsError('No authenticated user');
      return;
    }

    try {
      setNewsLoading(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      // Запрос локальных новостей
      const cityNewsConditions = [
        { type: 'where', field: 'cityKey', operator: '==', value: cityKey },
      ];
      const cityNews = await getCollection('news', cityNewsConditions);

      // Запрос глобальных новостей
      const globalNewsConditions = [
        { type: 'where', field: 'isGlobal', operator: '==', value: true },
      ];
      const globalNews = await getCollection('news', globalNewsConditions);

      // Объединяем и удаляем дубликаты
      const combinedNews = [...cityNews, ...globalNews].reduce((acc, curr) => {
        if (!acc.find((item) => item.id === curr.id)) {
          acc.push(curr);
        }
        return acc;
      }, []);

      // Сортируем новости по дате (сначала новые)
      combinedNews.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      // Добавляем категории для всех новостей
      const newsWithCategoriesAndComments = await Promise.all(
        combinedNews.map(async (item) => {
          // Получаем категорию
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            const categoryDoc = await getDocument('categories', item.categoryId.id);
            categoryName = categoryDoc?.name || categoryName;
          }
          
          // Получаем количество комментариев
          const commentConditions = [
            { type: 'where', field: 'parentCollection', operator: '==', value: 'news' },
            { type: 'where', field: 'parentId', operator: '==', value: `news/${item.id}` },
          ];
          const comments = await getCollection('comments', commentConditions);
          const commentCount = comments.length;
          
          return { ...item, categoryName, commentCount };
        })
      );

      setNews(newsWithCategoriesAndComments);
      setNewsError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setNewsError(err.message);
    } finally {
      setNewsLoading(false);
    }
  };

  // Получение количества комментариев для конкретной новости
  const getNewsCommentCount = async (newsId) => {
    try {
      const commentConditions = [
        { type: 'where', field: 'parentCollection', operator: '==', value: 'news' },
        { type: 'where', field: 'parentId', operator: '==', value: `news/${newsId}` },
      ];
      const comments = await getCollection('comments', commentConditions);
      return comments.length;
    } catch (err) {
      console.error('Error fetching comment count:', err);
      return 0;
    }
  };

  // Обновление количества комментариев для конкретной новости
  const updateNewsCommentCount = async (newsId) => {
    try {
      const commentCount = await getNewsCommentCount(newsId);
      
      // Обновляем новость в состоянии для немедленного отображения
      setNews(prevNews => 
        prevNews.map(item => 
          item.id === newsId ? { ...item, commentCount } : item
        )
      );
      
      return commentCount;
    } catch (err) {
      console.error('Error updating comment count:', err);
      return 0;
    }
  };

  // Загрузка событий
  const fetchEvents = () => {
    fetchData('events', setEvents, setEventsLoading, setEventsError);
  };

  // Загрузка опросов
  const fetchSurveys = () => {
    fetchData('surveys', setSurveys, setSurveysLoading, setSurveysError);
  };

  // Загрузка петиций
  const fetchPetitions = () => {
    fetchData('petitions', setPetitions, setPetitionsLoading, setPetitionsError);
  };

  // Загружаем все данные при изменении пользователя
  useEffect(() => {
    if (user && hasProfile === true) {
      Promise.all([
        fetchNews(),
        fetchEvents(),
        fetchSurveys(),
        fetchPetitions(),
      ]).catch((err) => {
        console.error('Error fetching data:', err);
      });
    }
  }, [user, hasProfile]);

  const refreshAllData = () => {
    fetchNews();
    fetchEvents();
    fetchSurveys();
    fetchPetitions();
  };

  return (
    <DataContext.Provider
      value={{
        news,
        newsLoading,
        newsError,
        fetchNews,
        events,
        eventsLoading,
        eventsError,
        fetchEvents,
        surveys,
        surveysLoading,
        surveysError,
        fetchSurveys,
        petitions,
        petitionsLoading,
        petitionsError,
        fetchPetitions,
        refreshAllData,
        getNewsCommentCount,
        updateNewsCommentCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);