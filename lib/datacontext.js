import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../lib/firebase'; // Ensure this points to your Firebase config

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, hasProfile } = useAuth();
  const { getCollection, getDocument } = useFirestore();

  // Состояния для новостей
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Состояния для поиска новостей
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

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

  // Filter states for news
  const [newsFilters, setNewsFilters] = useState({
    startDate: null,
    endDate: null,
    categories: [],
  });

  // Функция для поиска новостей в Firestore
const searchNews = async (searchText, language = 'en', filters = newsFilters) => {
  if (!user || hasProfile === false || !searchText) {
    setSearchResults([]);
    setIsSearchActive(false);
    return [];
  }

  try {
    setSearchLoading(true);
    setIsSearchActive(true);
    const userDoc = await getDocument('users', user.uid);
    const cityKey = userDoc?.cityKey;

    if (!cityKey) {
      throw new Error('User city not found');
    }

    // Получаем ссылку на коллекцию новостей
    const newsRef = collection(firestore, 'news');
    
    // Создаем запрос для поиска по городу и глобальных новостей
    const cityNewsQuery = query(newsRef, where('cityKey', '==', cityKey));
    const globalNewsQuery = query(newsRef, where('isGlobal', '==', true));
    
    // Выполняем запросы
    const [cityNewsSnapshot, globalNewsSnapshot] = await Promise.all([
      getDocs(cityNewsQuery),
      getDocs(globalNewsQuery)
    ]);
    
    // Объединяем результаты и удаляем дубликаты
    const allResults = [];
    const seenIds = new Set();
    
    cityNewsSnapshot.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        allResults.push({ id: doc.id, ...doc.data() });
      }
    });
    
    globalNewsSnapshot.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        allResults.push({ id: doc.id, ...doc.data() });
      }
    });
    
    // Фильтруем результаты по поисковому запросу
    const searchLower = searchText.toLowerCase();
    let filteredResults = allResults.filter(item => {
      const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
      const descriptionContains = item.shortDescription[language]?.toLowerCase().includes(searchLower);
      return titleContains || descriptionContains;
    });
    
    // Применяем фильтрацию по категориям на уровне JavaScript (аналогично fetchNews)
    if (filters.categories && filters.categories.length > 0) {
      filteredResults = filteredResults.filter(item => {
        if (!item.categoryId) return false;
        
        // Извлекаем ID категории из ссылки, независимо от формата
        let categoryId;
        
        if (typeof item.categoryId === 'object' && item.categoryId.id) {
          // Если это объект типа DocumentReference
          categoryId = item.categoryId.id;
        } else if (typeof item.categoryId === 'string') {
          // Если это строка типа '/news_categories/ID'
          categoryId = item.categoryId.split('/').pop();
        } else {
          return false;
        }
        
        // Проверяем, содержится ли ID категории в выбранных фильтрах
        return filters.categories.includes(categoryId);
      });
    }

    // Применяем фильтры по датам (так же как в fetchNews)
    if (filters.startDate || filters.endDate) {
      filteredResults = filteredResults.filter(item => {
        const newsDate = item.createdAt.toDate();
        if (filters.startDate && filters.endDate) {
          return newsDate >= filters.startDate && newsDate <= filters.endDate;
        } else if (filters.startDate) {
          return newsDate >= filters.startDate;
        } else if (filters.endDate) {
          return newsDate <= filters.endDate;
        }
        return true;
      });
    }
    
    // Сортируем по дате (сначала новые)
    filteredResults.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    
    // Добавляем категории и комментарии
    const resultsWithCategoriesAndComments = await Promise.all(
      filteredResults.map(async (item) => {
        // Получаем категорию
        let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
        if (item.categoryId) {
          let categoryId;
          
          if (typeof item.categoryId === 'object' && item.categoryId.id) {
            // Если это объект типа DocumentReference
            categoryId = item.categoryId.id;
          } else if (typeof item.categoryId === 'string') {
            // Если это строка типа '/news_categories/ID'
            categoryId = item.categoryId.split('/').pop();
          }
          
          if (categoryId) {
            const categoryDoc = await getDocument('news_categories', categoryId);
            categoryName = categoryDoc?.name || categoryName;
          }
        }
        
        // Получаем количество комментариев
        const commentConditions = [
          { type: 'where', field: 'parentCollection', operator: '==', value: 'news' },
          { type: 'where', field: 'parentId', operator: '==', value: `news/${item.id}` },
        ];
        const comments = await getCollection('news_comments', commentConditions);
        const commentCount = comments.length;
        
        return { ...item, categoryName, commentCount };
      })
    );
    
    setSearchResults(resultsWithCategoriesAndComments);
    setSearchError(null);
    return resultsWithCategoriesAndComments;
  } catch (err) {
    console.error('Error searching news:', err);
    setSearchError(err.message);
    return [];
  } finally {
    setSearchLoading(false);
  }
};

  // Сброс состояния поиска
  const resetSearch = () => {
    setSearchResults([]);
    setIsSearchActive(false);
    setSearchError(null);
  };

  // Обновленная функция для загрузки новостей с учетом фильтров
const fetchNews = async (filters = newsFilters) => {
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

    // Базовые условия для запроса
    let conditions = [
      { type: 'where', field: 'cityKey', operator: '==', value: cityKey },
    ];

    // Создаем базовый запрос для городских новостей
    const cityNewsRef = collection(firestore, 'news');
    const cityQuery = query(cityNewsRef, where('cityKey', '==', cityKey));
    
    // Создаем запрос для глобальных новостей
    const globalNewsRef = collection(firestore, 'news');
    const globalQuery = query(globalNewsRef, where('isGlobal', '==', true));
    
    // Выполняем базовые запросы
    const [citySnapshot, globalSnapshot] = await Promise.all([
      getDocs(cityQuery),
      getDocs(globalQuery),
    ]);
    
    // Объединяем результаты
    let combinedNews = [];
    const seenIds = new Set();
    
    citySnapshot.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        combinedNews.push({ id: doc.id, ...doc.data() });
      }
    });
    
    globalSnapshot.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        combinedNews.push({ id: doc.id, ...doc.data() });
      }
    });
    
    // Применяем фильтрацию по категориям на уровне JavaScript
    if (filters.categories && filters.categories.length > 0) {
      combinedNews = combinedNews.filter(item => {
        if (!item.categoryId) return false;
        
        // Извлекаем ID категории из ссылки, независимо от формата
        let categoryId;
        
        if (typeof item.categoryId === 'object' && item.categoryId.id) {
          // Если это объект типа DocumentReference
          categoryId = item.categoryId.id;
        } else if (typeof item.categoryId === 'string') {
          // Если это строка типа '/news_categories/ID'
          categoryId = item.categoryId.split('/').pop();
        } else {
          return false;
        }
        
        // Проверяем, содержится ли ID категории в выбранных фильтрах
        return filters.categories.includes(categoryId);
      });
    }

    // Применяем фильтры по датам
    if (filters.startDate || filters.endDate) {
      combinedNews = combinedNews.filter(item => {
        const newsDate = item.createdAt.toDate();
        if (filters.startDate && filters.endDate) {
          return newsDate >= filters.startDate && newsDate <= filters.endDate;
        } else if (filters.startDate) {
          return newsDate >= filters.startDate;
        } else if (filters.endDate) {
          return newsDate <= filters.endDate;
        }
        return true;
      });
    }

    // Сортируем новости по дате (сначала новые)
    combinedNews.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

    // Добавляем категории для всех новостей
    const newsWithCategoriesAndComments = await Promise.all(
      combinedNews.map(async (item) => {
        // Получаем категорию
        let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
        if (item.categoryId) {
          let categoryId;
          
          if (typeof item.categoryId === 'object' && item.categoryId.id) {
            // Если это объект типа DocumentReference
            categoryId = item.categoryId.id;
          } else if (typeof item.categoryId === 'string') {
            // Если это строка типа '/news_categories/ID'
            categoryId = item.categoryId.split('/').pop();
          }
          
          if (categoryId) {
            const categoryDoc = await getDocument('news_categories', categoryId);
            categoryName = categoryDoc?.name || categoryName;
          }
        }
        
        // Получаем количество комментариев
        const commentConditions = [
          { type: 'where', field: 'parentCollection', operator: '==', value: 'news' },
          { type: 'where', field: 'parentId', operator: '==', value: `news/${item.id}` },
        ];
        const comments = await getCollection('news_comments', commentConditions);
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

  // Add new function to handle filter updates
  const updateNewsFilters = async (newFilters) => {
    setNewsFilters(newFilters);
    await fetchNews(newFilters);
  };

  // Получение количества комментариев для конкретной новости
  const getNewsCommentCount = async (newsId) => {
    try {
      const commentConditions = [
        { type: 'where', field: 'parentCollection', operator: '==', value: 'news' },
        { type: 'where', field: 'parentId', operator: '==', value: `news/${newsId}` },
      ];
      const comments = await getCollection('news_comments', commentConditions);
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
      
      // Также обновляем результаты поиска, если они активны
      if (isSearchActive) {
        setSearchResults(prevResults => 
          prevResults.map(item => 
            item.id === newsId ? { ...item, commentCount } : item
          )
        );
      }
      
      return commentCount;
    } catch (err) {
      console.error('Error updating comment count:', err);
      return 0;
    }
  };

  // Получение количества просмотров для конкретной новости
  const getNewsViewCount = async (newsId) => {
    try {
      const newsDoc = await getDocument('news', newsId);
      return newsDoc.viewCount || 0;
    } catch (err) {
      console.error('Error fetching view count:', err);
      return 0;
    }
  };

  // Обновление количества просмотров для конкретной новости
  const updateNewsViewCount = async (newsId) => {
    try {
      const viewCount = await getNewsViewCount(newsId) + 1;

      // Обновляем новость в состоянии для немедленного отображения
      setNews(prevNews =>
        prevNews.map(item =>
          item.id === newsId ? { ...item, viewCount } : item
        )
      );
      
      // Также обновляем результаты поиска, если они активны
      if (isSearchActive) {
        setSearchResults(prevResults => 
          prevResults.map(item => 
            item.id === newsId ? { ...item, viewCount } : item
          )
        );
      }

      // Обновляем в Firestore
      const newsRef = doc(firestore, 'news', newsId);
      await updateDoc(newsRef, {
        viewCount: viewCount,
      });

      return viewCount;
    } catch (err) {
      console.error('Error updating view count:', err);
      return 0;
    }
  };

  // Загрузка событий
  const fetchEvents = () => {

  };

  // Загрузка опросов
  const fetchSurveys = () => {
  
  };

  // Загрузка петиций
  const fetchPetitions = () => {

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
    
    // Сбрасываем состояние поиска при обновлении всех данных
    resetSearch();
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
        getNewsViewCount,
        updateNewsViewCount,
        searchNews,
        searchResults,
        searchLoading,
        searchError,
        resetSearch,
        isSearchActive,
        newsFilters,
        updateNewsFilters,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);