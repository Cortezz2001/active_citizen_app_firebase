import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, hasProfile } = useAuth();
  const { getCollection, getDocument } = useFirestore();

  // News states
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [paginatedNews, setPaginatedNews] = useState([]);
  const [paginatedSearchResults, setPaginatedSearchResults] = useState([]);
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 3;

  // News search states
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Events states
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [paginatedEvents, setPaginatedEvents] = useState([]);
  const [paginatedEventSearchResults, setPaginatedEventSearchResults] = useState([]);
  const [currentEventsPage, setCurrentEventsPage] = useState(1);
  const [currentEventSearchPage, setCurrentEventSearchPage] = useState(1);
  const [isEventsLoadingMore, setIsEventsLoadingMore] = useState(false);
  const eventsItemsPerPage = 3;

  // Events search states
  const [eventSearchResults, setEventSearchResults] = useState([]);
  const [eventSearchLoading, setEventSearchLoading] = useState(false);
  const [eventSearchError, setEventSearchError] = useState(null);
  const [isEventSearchActive, setIsEventSearchActive] = useState(false);

  // Surveys states
  const [surveys, setSurveys] = useState([]);
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [surveysError, setSurveysError] = useState(null);

  // Petitions states
  const [petitions, setPetitions] = useState([]);
  const [petitionsLoading, setPetitionsLoading] = useState(true);
  const [petitionsError, setPetitionsError] = useState(null);

  // Filter states for news
  const [newsFilters, setNewsFilters] = useState({
    startDate: null,
    endDate: null,
    categories: [],
  });

  // Filter states for events
  const [eventFilters, setEventFilters] = useState({
    startDate: null,
    endDate: null,
    categories: [],
  });

  const loadMoreNews = () => {
    if (isSearchActive) {
      const startIndex = currentSearchPage * itemsPerPage;
      if (startIndex >= searchResults.length) return;
      setIsLoadingMore(true);
      setTimeout(() => {
        const newItems = searchResults.slice(startIndex, startIndex + itemsPerPage);
        setPaginatedSearchResults(prev => [...prev, ...newItems]);
        setCurrentSearchPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    } else {
      const startIndex = currentNewsPage * itemsPerPage;
      if (startIndex >= news.length) return;
      setIsLoadingMore(true);
      setTimeout(() => {
        const newItems = news.slice(startIndex, startIndex + itemsPerPage);
        setPaginatedNews(prev => [...prev, ...newItems]);
        setCurrentNewsPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const loadMoreEvents = () => {
    if (isEventSearchActive) {
      const startIndex = currentEventSearchPage * eventsItemsPerPage;
      if (startIndex >= eventSearchResults.length) return;
      setIsEventsLoadingMore(true);
      setTimeout(() => {
        const newItems = eventSearchResults.slice(startIndex, startIndex + eventsItemsPerPage);
        setPaginatedEventSearchResults(prev => [...prev, ...newItems]);
        setCurrentEventSearchPage(prev => prev + 1);
        setIsEventsLoadingMore(false);
      }, 500);
    } else {
      const startIndex = currentEventsPage * eventsItemsPerPage;
      if (startIndex >= events.length) return;
      setIsEventsLoadingMore(true);
      setTimeout(() => {
        const newItems = events.slice(startIndex, startIndex + eventsItemsPerPage);
        setPaginatedEvents(prev => [...prev, ...newItems]);
        setCurrentEventsPage(prev => prev + 1);
        setIsEventsLoadingMore(false);
      }, 500);
    }
  };

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

      const newsRef = collection(firestore, 'news');
      const cityNewsQuery = query(newsRef, where('cityKey', '==', cityKey));
      const globalNewsQuery = query(newsRef, where('isGlobal', '==', true));

      const [cityNewsSnapshot, globalNewsSnapshot] = await Promise.all([
        getDocs(cityNewsQuery),
        getDocs(globalNewsQuery)
      ]);

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

      const searchLower = searchText.toLowerCase();
      let filteredResults = allResults.filter(item => {
        const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
        const descriptionContains = item.shortDescription[language]?.toLowerCase().includes(searchLower);
        return titleContains || descriptionContains;
      });

      if (filters.categories && filters.categories.length > 0) {
        filteredResults = filteredResults.filter(item => {
          if (!item.categoryId) return false;
          let categoryId;
          if (typeof item.categoryId === 'object' && item.categoryId.id) {
            categoryId = item.categoryId.id;
          } else if (typeof item.categoryId === 'string') {
            categoryId = item.categoryId.split('/').pop();
          } else {
            return false;
          }
          return filters.categories.includes(categoryId);
        });
      }

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

      filteredResults.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      const resultsWithCategoriesAndComments = await Promise.all(
        filteredResults.map(async (item) => {
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('news_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }

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
      const initialItems = resultsWithCategoriesAndComments.slice(0, itemsPerPage);
      setPaginatedSearchResults(initialItems);
      setCurrentSearchPage(1);
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

  const searchEvents = async (searchText, language = 'en', filters = eventFilters) => {
    if (!user || hasProfile === false || !searchText) {
      setEventSearchResults([]);
      setIsEventSearchActive(false);
      return [];
    }

    try {
      setEventSearchLoading(true);
      setIsEventSearchActive(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      const eventsRef = collection(firestore, 'events');
      const cityEventsQuery = query(eventsRef, where('cityKey', '==', cityKey));
      const citySnapshot = await getDocs(cityEventsQuery);
      const allEvents = citySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const searchLower = searchText.toLowerCase();
      let filteredEvents = allEvents.filter(item => {
        const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
        const descriptionContains = item.description[language]?.toLowerCase().includes(searchLower);
        return titleContains || descriptionContains;
      });

      if (filters.categories && filters.categories.length > 0) {
        filteredEvents = filteredEvents.filter(item => {
          if (!item.categoryId) return false;
          let categoryId;
          if (typeof item.categoryId === 'object' && item.categoryId.id) {
            categoryId = item.categoryId.id;
          } else if (typeof item.categoryId === 'string') {
            categoryId = item.categoryId.split('/').pop();
          } else {
            return false;
          }
          return filters.categories.includes(categoryId);
        });
      }

      if (filters.startDate || filters.endDate) {
        filteredEvents = filteredEvents.filter(item => {
          const eventDate = item.date.toDate();
          if (filters.startDate && filters.endDate) {
            return eventDate >= filters.startDate && eventDate <= filters.endDate;
          } else if (filters.startDate) {
            return eventDate >= filters.startDate;
          } else if (filters.endDate) {
            return eventDate <= filters.endDate;
          }
          return true;
        });
      }

      filteredEvents.sort((a, b) => a.date.toDate() - b.date.toDate());

      const eventsWithCategories = await Promise.all(
        filteredEvents.map(async (item) => {
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('events_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, categoryName };
        })
      );

      setEventSearchResults(eventsWithCategories);
      const initialItems = eventsWithCategories.slice(0, eventsItemsPerPage);
      setPaginatedEventSearchResults(initialItems);
      setCurrentEventSearchPage(1);
      setEventSearchError(null);
      return eventsWithCategories;
    } catch (err) {
      console.error('Error searching events:', err);
      setEventSearchError(err.message);
      return [];
    } finally {
      setEventSearchLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResults([]);
    setPaginatedSearchResults([]);
    setCurrentSearchPage(1);
    setIsSearchActive(false);
    setSearchError(null);
  };

  const resetEventSearch = () => {
    setEventSearchResults([]);
    setPaginatedEventSearchResults([]);
    setCurrentEventSearchPage(1);
    setIsEventSearchActive(false);
    setEventSearchError(null);
  };

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

      let conditions = [
        { type: 'where', field: 'cityKey', operator: '==', value: cityKey },
      ];

      const cityNewsRef = collection(firestore, 'news');
      const cityQuery = query(cityNewsRef, where('cityKey', '==', cityKey));
      const globalNewsRef = collection(firestore, 'news');
      const globalQuery = query(globalNewsRef, where('isGlobal', '==', true));

      const [citySnapshot, globalSnapshot] = await Promise.all([
        getDocs(cityQuery),
        getDocs(globalQuery),
      ]);

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

      if (filters.categories && filters.categories.length > 0) {
        combinedNews = combinedNews.filter(item => {
          if (!item.categoryId) return false;
          let categoryId;
          if (typeof item.categoryId === 'object' && item.categoryId.id) {
            categoryId = item.categoryId.id;
          } else if (typeof item.categoryId === 'string') {
            categoryId = item.categoryId.split('/').pop();
          } else {
            return false;
          }
          return filters.categories.includes(categoryId);
        });
      }

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

      combinedNews.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      const newsWithCategoriesAndComments = await Promise.all(
        combinedNews.map(async (item) => {
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('news_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }

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
      const initialItems = newsWithCategoriesAndComments.slice(0, itemsPerPage);
      setPaginatedNews(initialItems);
      setCurrentNewsPage(1);
      setNewsError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setNewsError(err.message);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchEvents = async (filters = eventFilters) => {
    if (!user && hasProfile === false) {
      setEvents([]);
      setEventsLoading(false);
      setEventsError('No authenticated user');
      return;
    }

    try {
      setEventsLoading(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      const eventsRef = collection(firestore, 'events');
      const cityEventsQuery = query(eventsRef, where('cityKey', '==', cityKey));
      const citySnapshot = await getDocs(cityEventsQuery);
      let combinedEvents = citySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (filters.categories && filters.categories.length > 0) {
        combinedEvents = combinedEvents.filter(item => {
          if (!item.categoryId) return false;
          let categoryId;
          if (typeof item.categoryId === 'object' && item.categoryId.id) {
            categoryId = item.categoryId.id;
          } else if (typeof item.categoryId === 'string') {
            categoryId = item.categoryId.split('/').pop();
          } else {
            return false;
          }
          return filters.categories.includes(categoryId);
        });
      }

      if (filters.startDate || filters.endDate) {
        combinedEvents = combinedEvents.filter(item => {
          const eventDate = item.date.toDate();
          if (filters.startDate && filters.endDate) {
            return eventDate >= filters.startDate && eventDate <= filters.endDate;
          } else if (filters.startDate) {
            return eventDate >= filters.startDate;
          } else if (filters.endDate) {
            return eventDate <= filters.endDate;
          }
          return true;
        });
      }

      combinedEvents.sort((a, b) => a.date.toDate() - b.date.toDate());

      const eventsWithCategories = await Promise.all(
        combinedEvents.map(async (item) => {
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('events_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, categoryName };
        })
      );

      setEvents(eventsWithCategories);
      const initialItems = eventsWithCategories.slice(0, eventsItemsPerPage);
      setPaginatedEvents(initialItems);
      setCurrentEventsPage(1);
      setEventsError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEventsError(err.message);
    } finally {
      setEventsLoading(false);
    }
  };

  const updateNewsFilters = async (newFilters) => {
    setNewsFilters(newFilters);
    await fetchNews(newFilters);
  };

  const updateEventFilters = async (newFilters) => {
    setEventFilters(newFilters);
    await fetchEvents(newFilters);
  };

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

  const updateNewsCommentCount = async (newsId) => {
    try {
      const commentCount = await getNewsCommentCount(newsId);
      setNews(prevNews => 
        prevNews.map(item => 
          item.id === newsId ? { ...item, commentCount } : item
        )
      );
      setPaginatedNews(prevNews => 
        prevNews.map(item => 
          item.id === newsId ? { ...item, commentCount } : item
        )
      );
      if (isSearchActive) {
        setSearchResults(prevResults => 
          prevResults.map(item => 
            item.id === newsId ? { ...item, commentCount } : item
          )
        );
        setPaginatedSearchResults(prevResults => 
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

  const getNewsViewCount = async (newsId) => {
    try {
      const newsDoc = await getDocument('news', newsId);
      return newsDoc.viewCount || 0;
    } catch (err) {
      console.error('Error fetching view count:', err);
      return 0;
    }
  };

  const updateNewsViewCount = async (newsId) => {
    try {
      const viewCount = await getNewsViewCount(newsId) + 1;
      setNews(prevNews =>
        prevNews.map(item =>
          item.id === newsId ? { ...item, viewCount } : item
        )
      );
      setPaginatedNews(prevNews =>
        prevNews.map(item =>
          item.id === newsId ? { ...item, viewCount } : item
        )
      );
      if (isSearchActive) {
        setSearchResults(prevResults => 
          prevResults.map(item => 
            item.id === newsId ? { ...item, viewCount } : item
          )
        );
        setPaginatedSearchResults(prevResults => 
          prevResults.map(item => 
            item.id === newsId ? { ...item, viewCount } : item
          )
        );
      }
      const newsRef = doc(firestore, 'news', newsId);
      await updateDoc(newsRef, { viewCount });
      return viewCount;
    } catch (err) {
      console.error('Error updating view count:', err);
      return 0;
    }
  };

  const fetchSurveys = () => {
    // Placeholder for surveys
  };

  const fetchPetitions = () => {
    // Placeholder for petitions
  };

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
    resetSearch();
    resetEventSearch();
  };

  return (
    <DataContext.Provider
      value={{
        news,
        newsLoading,
        newsError,
        fetchNews,
        loadMoreNews,
        paginatedNews,
        paginatedSearchResults,
        isLoadingMore,
        searchNews,
        searchResults,
        searchLoading,
        searchError,
        resetSearch,
        isSearchActive,
        newsFilters,
        updateNewsFilters,
        events,
        eventsLoading,
        eventsError,
        fetchEvents,
        loadMoreEvents,
        paginatedEvents,
        paginatedEventSearchResults,
        isEventsLoadingMore,
        searchEvents,
        eventSearchResults,
        eventSearchLoading,
        eventSearchError,
        resetEventSearch,
        isEventSearchActive,
        eventFilters,
        updateEventFilters,
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);