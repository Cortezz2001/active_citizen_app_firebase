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
  const itemsPerPage = 4;

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
  const eventsItemsPerPage = 4;

  // Events search states
  const [eventSearchResults, setEventSearchResults] = useState([]);
  const [eventSearchLoading, setEventSearchLoading] = useState(false);
  const [eventSearchError, setEventSearchError] = useState(null);
  const [isEventSearchActive, setIsEventSearchActive] = useState(false);

  // Surveys states
  const [surveys, setSurveys] = useState([]);
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [surveysError, setSurveysError] = useState(null);
  const [paginatedSurveys, setPaginatedSurveys] = useState([]);
  const [paginatedSurveySearchResults, setPaginatedSurveySearchResults] = useState([]);
  const [currentSurveysPage, setCurrentSurveysPage] = useState(1);
  const [currentSurveySearchPage, setCurrentSurveySearchPage] = useState(1);
  const [isSurveysLoadingMore, setIsSurveysLoadingMore] = useState(false);
  const surveysItemsPerPage = 4;

  // Surveys search states
  const [surveySearchResults, setSurveySearchResults] = useState([]);
  const [surveySearchLoading, setSurveySearchLoading] = useState(false);
  const [surveySearchError, setSurveySearchError] = useState(null);
  const [isSurveySearchActive, setIsSurveySearchActive] = useState(false);

  // Petitions states
  const [petitions, setPetitions] = useState([]);
  const [petitionsLoading, setPetitionsLoading] = useState(true);
  const [petitionsError, setPetitionsError] = useState(null);
  const [paginatedPetitions, setPaginatedPetitions] = useState([]);
  const [paginatedPetitionSearchResults, setPaginatedPetitionSearchResults] = useState([]);
  const [currentPetitionsPage, setCurrentPetitionsPage] = useState(1);
  const [currentPetitionSearchPage, setCurrentPetitionSearchPage] = useState(1);
  const [isPetitionsLoadingMore, setIsPetitionsLoadingMore] = useState(false);
  const petitionsItemsPerPage = 4;

  // Petitions search states
  const [petitionSearchResults, setPetitionSearchResults] = useState([]);
  const [petitionSearchLoading, setPetitionSearchLoading] = useState(false);
  const [petitionSearchError, setPetitionSearchError] = useState(null);
  const [isPetitionSearchActive, setIsPetitionSearchActive] = useState(false);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  const [paginatedRequests, setPaginatedRequests] = useState([]);
  const [paginatedRequestSearchResults, setPaginatedRequestSearchResults] = useState([]);
  const [currentRequestsPage, setCurrentRequestsPage] = useState(1);
  const [currentRequestSearchPage, setCurrentRequestSearchPage] = useState(1);
  const [isRequestsLoadingMore, setIsRequestsLoadingMore] = useState(false);
  const requestsItemsPerPage = 4;

  const [requestSearchResults, setRequestSearchResults] = useState([]);
  const [requestSearchLoading, setRequestSearchLoading] = useState(false);
  const [requestSearchError, setRequestSearchError] = useState(null);
  const [isRequestSearchActive, setIsRequestSearchActive] = useState(false);

  // User surveys states
  const [userSurveys, setUserSurveys] = useState([]);
  const [userSurveysLoading, setUserSurveysLoading] = useState(true);
  const [userSurveysError, setUserSurveysError] = useState(null);
  const [paginatedUserSurveys, setPaginatedUserSurveys] = useState([]);
  const [paginatedUserSurveySearchResults, setPaginatedUserSurveySearchResults] = useState([]);
  const [currentUserSurveysPage, setCurrentUserSurveysPage] = useState(1);
  const [currentUserSurveySearchPage, setCurrentUserSurveySearchPage] = useState(1);
  const [isUserSurveysLoadingMore, setIsUserSurveysLoadingMore] = useState(false);
  const userSurveysItemsPerPage = 4;

  const [userSurveySearchResults, setUserSurveySearchResults] = useState([]);
  const [userSurveySearchLoading, setUserSurveySearchLoading] = useState(false);
  const [userSurveySearchError, setUserSurveySearchError] = useState(null);
  const [isUserSurveySearchActive, setIsUserSurveySearchActive] = useState(false);

  const [userPetitions, setUserPetitions] = useState([]);
const [userPetitionsLoading, setUserPetitionsLoading] = useState(true);
const [userPetitionsError, setUserPetitionsError] = useState(null);
const [paginatedUserPetitions, setPaginatedUserPetitions] = useState([]);
const [paginatedUserPetitionSearchResults, setPaginatedUserPetitionSearchResults] = useState([]);
const [currentUserPetitionsPage, setCurrentUserPetitionsPage] = useState(1);
const [currentUserPetitionSearchPage, setCurrentUserPetitionSearchPage] = useState(1);
const [isUserPetitionsLoadingMore, setIsUserPetitionsLoadingMore] = useState(false);
const userPetitionsItemsPerPage = 4;

const [userPetitionSearchResults, setUserPetitionSearchResults] = useState([]);
const [userPetitionSearchLoading, setUserPetitionSearchLoading] = useState(false);
const [userPetitionSearchError, setUserPetitionSearchError] = useState(null);
const [isUserPetitionSearchActive, setIsUserPetitionSearchActive] = useState(false);

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

  // Filter states for surveys
  const [surveyFilters, setSurveyFilters] = useState({
    status: [],
    categories: [],
  });

  // Filter states for petitions
  const [petitionFilters, setPetitionFilters] = useState({
    status: [],
    categories: [],
  });

  const [requestFilters, setRequestFilters] = useState({
    startDate: null,
    endDate: null,
    categories: [],
    statuses: [],
  });

  const [userSurveyFilters, setUserSurveyFilters] = useState({
    statuses: [],
    categories: [],
    startDate: null,
    endDate: null,
  });

  const [userPetitionFilters, setUserPetitionFilters] = useState({
    statuses: [],
    categories: [],
    startDate: null,
    endDate: null,
});

  const checkIfUserVoted = async (surveyId, userId) => {
    try {
      const surveyResultRef = collection(firestore, 'surveys_results');
      const q = query(surveyResultRef, where('surveyId', '==', `/surveys/${surveyId}`), where('userId', '==', `/users/${userId}`));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (err) {
      console.error('Error checking if user voted:', err);
      return false;
    }
  };

  const checkIfUserSigned = async (petitionId, userId) => {
    try {
      const petitionSignatureRef = collection(firestore, 'petitions_signatures');
      const q = query(
        petitionSignatureRef,
        where('petitionId', '==', `/petitions/${petitionId}`),
        where('userId', '==', `/users/${userId}`)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (err) {
      console.error('Error checking if user signed:', err);
      return false;
    }
  };

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

  const loadMoreSurveys = () => {
    if (isSurveySearchActive) {
      const startIndex = currentSurveySearchPage * surveysItemsPerPage;
      if (startIndex >= surveySearchResults.length) return;
      setIsSurveysLoadingMore(true);
      setTimeout(() => {
        const newItems = surveySearchResults.slice(startIndex, startIndex + surveysItemsPerPage);
        setPaginatedSurveySearchResults(prev => [...prev, ...newItems]);
        setCurrentSurveySearchPage(prev => prev + 1);
        setIsSurveysLoadingMore(false);
      }, 500);
    } else {
      const startIndex = currentSurveysPage * surveysItemsPerPage;
      if (startIndex >= surveys.length) return;
      setIsSurveysLoadingMore(true);
      setTimeout(() => {
        const newItems = surveys.slice(startIndex, startIndex + surveysItemsPerPage);
        setPaginatedSurveys(prev => [...prev, ...newItems]);
        setCurrentSurveysPage(prev => prev + 1);
        setIsSurveysLoadingMore(false);
      }, 500);
    }
  };

  const loadMorePetitions = () => {
    if (isPetitionSearchActive) {
      const startIndex = currentPetitionSearchPage * petitionsItemsPerPage;
      if (startIndex >= petitionSearchResults.length) return;
      setIsPetitionsLoadingMore(true);
      setTimeout(() => {
        const newItems = petitionSearchResults.slice(startIndex, startIndex + petitionsItemsPerPage);
        setPaginatedPetitionSearchResults(prev => [...prev, ...newItems]);
        setCurrentPetitionSearchPage(prev => prev + 1);
        setIsPetitionsLoadingMore(false);
      }, 500);
    } else {
      const startIndex = currentPetitionsPage * petitionsItemsPerPage;
      if (startIndex >= petitions.length) return;
      setIsPetitionsLoadingMore(true);
      setTimeout(() => {
        const newItems = petitions.slice(startIndex, startIndex + petitionsItemsPerPage);
        setPaginatedPetitions(prev => [...prev, ...newItems]);
        setCurrentPetitionsPage(prev => prev + 1);
        setIsPetitionsLoadingMore(false);
      }, 500);
    }
  };

  const loadMoreRequests = () => {
    if (isRequestSearchActive) {
      const startIndex = currentRequestSearchPage * requestsItemsPerPage;
      if (startIndex >= requestSearchResults.length) return;
      setIsRequestsLoadingMore(true);
      setTimeout(() => {
        const newItems = requestSearchResults.slice(startIndex, startIndex + requestsItemsPerPage);
        setPaginatedRequestSearchResults(prev => [...prev, ...newItems]);
        setCurrentRequestSearchPage(prev => prev + 1);
        setIsRequestsLoadingMore(false);
      }, 500);
    } else {
      const startIndex = currentRequestsPage * requestsItemsPerPage;
      if (startIndex >= requests.length) return;
      setIsRequestsLoadingMore(true);
      setTimeout(() => {
        const newItems = requests.slice(startIndex, startIndex + requestsItemsPerPage);
        setPaginatedRequests(prev => [...prev, ...newItems]);
        setCurrentRequestsPage(prev => prev + 1);
        setIsRequestsLoadingMore(false);
      }, 500);
    }
  };

  const loadMoreUserSurveys = () => {
    if (isUserSurveySearchActive) {
      const startIndex = currentUserSurveySearchPage * userSurveysItemsPerPage;
      if (startIndex >= userSurveySearchResults.length) return;
      setIsUserSurveysLoadingMore(true);
      setTimeout(() => {
        const newItems = userSurveySearchResults.slice(startIndex, startIndex + userSurveysItemsPerPage);
        setPaginatedUserSurveySearchResults(prev => [...prev, ...newItems]);
        setCurrentUserSurveySearchPage(prev => prev + 1);
        setIsUserSurveysLoadingMore(false);
      }, 500);
    } else {
      const startIndex = currentUserSurveysPage * userSurveysItemsPerPage;
      if (startIndex >= userSurveys.length) return;
      setIsUserSurveysLoadingMore(true);
      setTimeout(() => {
        const newItems = userSurveys.slice(startIndex, startIndex + userSurveysItemsPerPage);
        setPaginatedUserSurveys(prev => [...prev, ...newItems]);
        setCurrentUserSurveysPage(prev => prev + 1);
        setIsUserSurveysLoadingMore(false);
      }, 500);
    }
  };

  const loadMoreUserPetitions = () => {
    if (isUserPetitionSearchActive) {
        const startIndex = currentUserPetitionSearchPage * userPetitionsItemsPerPage;
        if (startIndex >= userPetitionSearchResults.length) return;
        setIsUserPetitionsLoadingMore(true);
        setTimeout(() => {
            const newItems = userPetitionSearchResults.slice(startIndex, startIndex + userPetitionsItemsPerPage);
            setPaginatedUserPetitionSearchResults(prev => [...prev, ...newItems]);
            setCurrentUserPetitionSearchPage(prev => prev + 1);
            setIsUserPetitionsLoadingMore(false);
        }, 500);
    } else {
        const startIndex = currentUserPetitionsPage * userPetitionsItemsPerPage;
        if (startIndex >= userPetitions.length) return;
        setIsUserPetitionsLoadingMore(true);
        setTimeout(() => {
            const newItems = userPetitions.slice(startIndex, startIndex + userPetitionsItemsPerPage);
            setPaginatedUserPetitions(prev => [...prev, ...newItems]);
            setCurrentUserPetitionsPage(prev => prev + 1);
            setIsUserPetitionsLoadingMore(false);
        }, 500);
    }
};

  const searchNews = async (searchText, language = 'en', filters = newsFilters) => {
    if (!user && hasProfile === false || !searchText) {
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
    if (!user && hasProfile === false || !searchText) {
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

  const searchSurveys = async (searchText, language = 'en', filters = surveyFilters) => {
    if (!user && hasProfile === false || !searchText) {
      setSurveySearchResults([]);
      setIsSurveySearchActive(false);
      return [];
    }

    try {
      setSurveySearchLoading(true);
      setIsSurveySearchActive(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      const surveysRef = collection(firestore, 'surveys');
      const statusQuery = query(surveysRef, where('status', 'in', ['Published', 'Completed']));

      const [globalSurveysSnapshot, citySurveysSnapshot] = await Promise.all([
        getDocs(query(statusQuery, where('isGlobal', '==', true))),
        getDocs(query(statusQuery, where('cityKey', '==', cityKey))),
      ]);

      const allSurveys = [];
      const seenIds = new Set();

      globalSurveysSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allSurveys.push({ id: doc.id, ...doc.data() });
        }
      });

      citySurveysSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allSurveys.push({ id: doc.id, ...doc.data() });
        }
      });

      const searchLower = searchText.toLowerCase();
      let filteredSurveys = allSurveys.filter(item => {
        const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
        const descriptionContains = item.description[language]?.toLowerCase().includes(searchLower);
        return titleContains || descriptionContains;
      });

      if (filters.status && filters.status.length > 0) {
        filteredSurveys = filteredSurveys.filter(item => filters.status.includes(item.status));
      }

      if (filters.categories && filters.categories.length > 0) {
        filteredSurveys = filteredSurveys.filter(item => {
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

      const surveysWithVoteStatus = await Promise.all(
        filteredSurveys.map(async (item) => {
          const hasVoted = await checkIfUserVoted(item.id, user.uid);
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('surveys_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, hasVoted, categoryName };
        })
      );

      setSurveySearchResults(surveysWithVoteStatus);
      const initialItems = surveysWithVoteStatus.slice(0, surveysItemsPerPage);
      setPaginatedSurveySearchResults(initialItems);
      setCurrentSurveySearchPage(1);
      setSurveySearchError(null);
      return surveysWithVoteStatus;
    } catch (err) {
      console.error('Error searching surveys:', err);
      setSurveySearchError(err.message);
      return [];
    } finally {
      setSurveySearchLoading(false);
    }
  };

  const searchPetitions = async (searchText, language = 'en', filters = petitionFilters) => {
    if (!user && hasProfile === false || !searchText) {
      setPetitionSearchResults([]);
      setIsPetitionSearchActive(false);
      return [];
    }

    try {
      setPetitionSearchLoading(true);
      setIsPetitionSearchActive(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      const petitionsRef = collection(firestore, 'petitions');
      const statusQuery = query(petitionsRef, where('status', 'in', ['Published', 'Completed']));

      const [globalPetitionsSnapshot, cityPetitionsSnapshot] = await Promise.all([
        getDocs(query(statusQuery, where('isGlobal', '==', true))),
        getDocs(query(statusQuery, where('cityKey', '==', cityKey))),
      ]);

      const allPetitions = [];
      const seenIds = new Set();

      globalPetitionsSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allPetitions.push({ id: doc.id, ...doc.data() });
        }
      });

      cityPetitionsSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allPetitions.push({ id: doc.id, ...doc.data() });
        }
      });

      const searchLower = searchText.toLowerCase();
      let filteredPetitions = allPetitions.filter(item => {
        const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
        const descriptionContains = item.description[language]?.toLowerCase().includes(searchLower);
        return titleContains || descriptionContains;
      });

      if (filters.status && filters.status.length > 0) {
        filteredPetitions = filteredPetitions.filter(item => filters.status.includes(item.status));
      }

      if (filters.categories && filters.categories.length > 0) {
        filteredPetitions = filteredPetitions.filter(item => {
          if (!item.categoryId) return false;
          let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
          return filters.categories.includes(categoryId);
        });
      }

      const petitionsWithSignStatus = await Promise.all(
        filteredPetitions.map(async (item) => {
          const hasSigned = await checkIfUserSigned(item.id, user.uid);
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
            if (categoryId) {
              const categoryDoc = await getDocument('petitions_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, hasSigned, categoryName };
        })
      );

      setPetitionSearchResults(petitionsWithSignStatus);
      const initialItems = petitionsWithSignStatus.slice(0, petitionsItemsPerPage);
      setPaginatedPetitionSearchResults(initialItems);
      setCurrentPetitionSearchPage(1);
      setPetitionSearchError(null);
      return petitionsWithSignStatus;
    } catch (err) {
      console.error('Error searching petitions:', err);
      setPetitionSearchError(err.message);
      return [];
    } finally {
      setPetitionSearchLoading(false);
    }
  };

  const searchRequests = async (searchText, language = 'en', filters = requestFilters) => {
    if (!user && hasProfile === false || !searchText) {
      setRequestSearchResults([]);
      setIsRequestSearchActive(false);
      return [];
    }
    try {
      setRequestSearchLoading(true);
      setIsRequestSearchActive(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;
      if (!cityKey) throw new Error('User city not found');
      const requestsRef = collection(firestore, 'requests');
      const userRequestsQuery = query(requestsRef, where('userId', '==', `/users/${user.uid}`));
      const snapshot = await getDocs(userRequestsQuery);
      let allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const searchLower = searchText.toLowerCase();
      let filteredRequests = allRequests.filter(item => {
        const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
        const descriptionContains = item.description[language]?.toLowerCase().includes(searchLower);
        return titleContains || descriptionContains;
      });
      if (filters.statuses && filters.statuses.length > 0) {
        filteredRequests = filteredRequests.filter(item => filters.statuses.includes(item.status));
      }
      if (filters.categories && filters.categories.length > 0) {
        filteredRequests = filteredRequests.filter(item => {
          if (!item.categoryId) return false;
          let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
          return filters.categories.includes(categoryId);
        });
      }
      if (filters.startDate || filters.endDate) {
        filteredRequests = filteredRequests.filter(item => {
          const requestDate = item.createdAt.toDate();
          if (filters.startDate && filters.endDate) return requestDate >= filters.startDate && requestDate <= filters.endDate;
          else if (filters.startDate) return requestDate >= filters.startDate;
          else if (filters.endDate) return requestDate <= filters.endDate;
          return true;
        });
      }
      filteredRequests.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      const requestsWithCategories = await Promise.all(
        filteredRequests.map(async (item) => {
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
            if (categoryId) {
              const categoryDoc = await getDocument('requests_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, categoryName };
        })
      );
      setRequestSearchResults(requestsWithCategories);
      const initialItems = requestsWithCategories.slice(0, requestsItemsPerPage);
      setPaginatedRequestSearchResults(initialItems);
      setCurrentRequestSearchPage(1);
      setRequestSearchError(null);
      return requestsWithCategories;
    } catch (err) {
      console.error('Error searching requests:', err);
      setRequestSearchError(err.message);
      return [];
    } finally {
      setRequestSearchLoading(false);
    }
  };

  const searchUserSurveys = async (searchText, language = 'en', filters = userSurveyFilters) => {
    if (!user && hasProfile === false || !searchText) {
      setUserSurveySearchResults([]);
      setIsUserSurveySearchActive(false);
      return [];
    }
    try {
      setUserSurveySearchLoading(true);
      setIsUserSurveySearchActive(true);
      const surveysRef = collection(firestore, 'surveys');
      const userSurveysQuery = query(surveysRef, where('userId', '==', `/users/${user.uid}`));
      const snapshot = await getDocs(userSurveysQuery);
      let allSurveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const searchLower = searchText.toLowerCase();
      let filteredSurveys = allSurveys.filter(item => {
        const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
        const descriptionContains = item.description[language]?.toLowerCase().includes(searchLower);
        return titleContains || descriptionContains;
      });
      if (filters.statuses.length > 0) {
        filteredSurveys = filteredSurveys.filter(item => filters.statuses.includes(item.status));
      }
      if (filters.categories.length > 0) {
        filteredSurveys = filteredSurveys.filter(item => {
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
        filteredSurveys = filteredSurveys.filter(item => {
          const surveyDate = item.createdAt.toDate();
          if (filters.startDate && filters.endDate) return surveyDate >= filters.startDate && surveyDate <= filters.endDate;
          else if (filters.startDate) return surveyDate >= filters.startDate;
          else if (filters.endDate) return surveyDate <= filters.endDate;
          return true;
        });
      }
      filteredSurveys.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      const surveysWithVoteStatus = await Promise.all(
        filteredSurveys.map(async (item) => {
          const hasVoted = await checkIfUserVoted(item.id, user.uid);
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('surveys_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, hasVoted, categoryName };
        })
      );
      setUserSurveySearchResults(surveysWithVoteStatus);
      const initialItems = surveysWithVoteStatus.slice(0, userSurveysItemsPerPage);
      setPaginatedUserSurveySearchResults(initialItems);
      setCurrentUserSurveySearchPage(1);
      setUserSurveySearchError(null);
      return surveysWithVoteStatus;
    } catch (err) {
      console.error('Error searching user surveys:', err);
      setUserSurveySearchError(err.message);
      return [];
    } finally {
      setUserSurveySearchLoading(false);
    }
  };

  const searchUserPetitions = async (searchText, language = 'en', filters = userPetitionFilters) => {
    if (!user && hasProfile === false || !searchText) {
        setUserPetitionSearchResults([]);
        setIsUserPetitionSearchActive(false);
        return [];
    }
    try {
        setUserPetitionSearchLoading(true);
        setIsUserPetitionSearchActive(true);
        const petitionsRef = collection(firestore, 'petitions');
        const userPetitionsQuery = query(petitionsRef, where('userId', '==', `/users/${user.uid}`));
        const snapshot = await getDocs(userPetitionsQuery);
        let allPetitions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const searchLower = searchText.toLowerCase();
        let filteredPetitions = allPetitions.filter(item => {
            const titleContains = item.title[language]?.toLowerCase().includes(searchLower);
            const descriptionContains = item.description[language]?.toLowerCase().includes(searchLower);
            return titleContains || descriptionContains;
        });

        if (filters.statuses.length > 0) {
            filteredPetitions = filteredPetitions.filter(item => filters.statuses.includes(item.status));
        }
        if (filters.categories.length > 0) {
            filteredPetitions = filteredPetitions.filter(item => {
                if (!item.categoryId) return false;
                let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
                return filters.categories.includes(categoryId);
            });
        }
        if (filters.startDate || filters.endDate) {
            filteredPetitions = filteredPetitions.filter(item => {
                const petitionDate = item.createdAt.toDate();
                if (filters.startDate && filters.endDate) return petitionDate >= filters.startDate && petitionDate <= filters.endDate;
                else if (filters.startDate) return petitionDate >= filters.startDate;
                else if (filters.endDate) return petitionDate <= filters.endDate;
                return true;
            });
        }
        filteredPetitions.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        const petitionsWithSignStatus = await Promise.all(
            filteredPetitions.map(async (item) => {
                const hasSigned = await checkIfUserSigned(item.id, user.uid);
                let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
                if (item.categoryId) {
                    let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
                    if (categoryId) {
                        const categoryDoc = await getDocument('petitions_categories', categoryId);
                        categoryName = categoryDoc?.name || categoryName;
                    }
                }
                return { ...item, hasSigned, categoryName };
            })
        );

        setUserPetitionSearchResults(petitionsWithSignStatus);
        const initialItems = petitionsWithSignStatus.slice(0, userPetitionsItemsPerPage);
        setPaginatedUserPetitionSearchResults(initialItems);
        setCurrentUserPetitionSearchPage(1);
        setUserPetitionSearchError(null);
        return petitionsWithSignStatus;
    } catch (err) {
        console.error('Error searching user petitions:', err);
        setUserPetitionSearchError(err.message);
        return [];
    } finally {
        setUserPetitionSearchLoading(false);
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

  const resetSurveySearch = () => {
    setSurveySearchResults([]);
    setPaginatedSurveySearchResults([]);
    setCurrentSurveySearchPage(1);
    setIsSurveySearchActive(false);
    setSurveySearchError(null);
  };

  const resetPetitionSearch = () => {
    setPetitionSearchResults([]);
    setPaginatedPetitionSearchResults([]);
    setCurrentPetitionSearchPage(1);
    setIsPetitionSearchActive(false);
    setPetitionSearchError(null);
  };

  const resetRequestSearch = () => {
    setRequestSearchResults([]);
    setPaginatedRequestSearchResults([]);
    setCurrentRequestSearchPage(1);
    setIsRequestSearchActive(false);
    setRequestSearchError(null);
  };

  const resetUserSurveySearch = () => {
    setUserSurveySearchResults([]);
    setPaginatedUserSurveySearchResults([]);
    setCurrentUserSurveySearchPage(1);
    setIsUserSurveySearchActive(false);
    setUserSurveySearchError(null);
  };

  const resetUserPetitionSearch = () => {
    setUserPetitionSearchResults([]);
    setPaginatedUserPetitionSearchResults([]);
    setCurrentUserPetitionSearchPage(1);
    setIsUserPetitionSearchActive(false);
    setUserPetitionSearchError(null);
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

  const fetchSurveys = async (filters = surveyFilters) => {
    if (!user && hasProfile === false) {
      setSurveys([]);
      setSurveysLoading(false);
      setSurveysError('No authenticated user');
      return;
    }

    try {
      setSurveysLoading(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      const surveysRef = collection(firestore, 'surveys');
      const statusQuery = query(surveysRef, where('status', 'in', ['Published', 'Completed']));

      const [globalSurveysSnapshot, citySurveysSnapshot] = await Promise.all([
        getDocs(query(statusQuery, where('isGlobal', '==', true))),
        getDocs(query(statusQuery, where('cityKey', '==', cityKey))),
      ]);

      const allSurveys = [];
      const seenIds = new Set();

      globalSurveysSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allSurveys.push({ id: doc.id, ...doc.data() });
        }
      });

      citySurveysSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allSurveys.push({ id: doc.id, ...doc.data() });
        }
      });

      let filteredSurveys = allSurveys;

      if (filters.status && filters.status.length > 0) {
        filteredSurveys = filteredSurveys.filter(item => filters.status.includes(item.status));
      }

      if (filters.categories && filters.categories.length > 0) {
        filteredSurveys = filteredSurveys.filter(item => {
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

      filteredSurveys.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      const surveysWithVoteStatus = await Promise.all(
        filteredSurveys.map(async (item) => {
          const hasVoted = await checkIfUserVoted(item.id, user.uid);
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('surveys_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, hasVoted, categoryName };
        })
      );

      setSurveys(surveysWithVoteStatus);
      const initialItems = surveysWithVoteStatus.slice(0, surveysItemsPerPage);
      setPaginatedSurveys(initialItems);
      setCurrentSurveysPage(1);
      setSurveysError(null);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setSurveysError(err.message);
    } finally {
      setSurveysLoading(false);
    }
  };

  const fetchPetitions = async (filters = petitionFilters) => {
    if (!user && hasProfile === false) {
      setPetitions([]);
      setPetitionsLoading(false);
      setPetitionsError('No authenticated user');
      return;
    }

    try {
      setPetitionsLoading(true);
      const userDoc = await getDocument('users', user.uid);
      const cityKey = userDoc?.cityKey;

      if (!cityKey) {
        throw new Error('User city not found');
      }

      const petitionsRef = collection(firestore, 'petitions');
      const statusQuery = query(petitionsRef, where('status', 'in', ['Published', 'Completed']));

      const [globalPetitionsSnapshot, cityPetitionsSnapshot] = await Promise.all([
        getDocs(query(statusQuery, where('isGlobal', '==', true))),
        getDocs(query(statusQuery, where('cityKey', '==', cityKey))),
      ]);

      const allPetitions = [];
      const seenIds = new Set();

      globalPetitionsSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allPetitions.push({ id: doc.id, ...doc.data() });
        }
      });

      cityPetitionsSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          allPetitions.push({ id: doc.id, ...doc.data() });
        }
      });

      let filteredPetitions = allPetitions;

      if (filters.status && filters.status.length > 0) {
        filteredPetitions = filteredPetitions.filter(item => filters.status.includes(item.status));
      }

      if (filters.categories && filters.categories.length > 0) {
        filteredPetitions = filteredPetitions.filter(item => {
          if (!item.categoryId) return false;
          let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
          return filters.categories.includes(categoryId);
        });
      }

      filteredPetitions.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      const petitionsWithSignStatus = await Promise.all(
        filteredPetitions.map(async (item) => {
          const hasSigned = await checkIfUserSigned(item.id, user.uid);
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
            if (categoryId) {
              const categoryDoc = await getDocument('petitions_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, hasSigned, categoryName };
        })
      );

      setPetitions(petitionsWithSignStatus);
      const initialItems = petitionsWithSignStatus.slice(0, petitionsItemsPerPage);
      setPaginatedPetitions(initialItems);
      setCurrentPetitionsPage(1);
      setPetitionsError(null);
    } catch (err) {
      console.error('Error fetching petitions:', err);
      setPetitionsError(err.message);
    } finally {
      setPetitionsLoading(false);
    }
  };

  const fetchRequests = async (filters = requestFilters) => {
    if (!user && hasProfile === false) {
      setRequests([]);
      setRequestsLoading(false);
      setRequestsError('No authenticated user');
      return;
    }
    try {
      setRequestsLoading(true);
      const requestsRef = collection(firestore, 'requests');
      const userRequestsQuery = query(requestsRef, where('userId', '==', `/users/${user.uid}`));
      const snapshot = await getDocs(userRequestsQuery);
      let allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (filters.statuses && filters.statuses.length > 0) {
        allRequests = allRequests.filter(item => filters.statuses.includes(item.status));
      }
      if (filters.categories && filters.categories.length > 0) {
        allRequests = allRequests.filter(item => {
          if (!item.categoryId) return false;
          let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
          return filters.categories.includes(categoryId);
        });
      }
      if (filters.startDate || filters.endDate) {
        allRequests = allRequests.filter(item => {
          const requestDate = item.createdAt.toDate();
          if (filters.startDate && filters.endDate) return requestDate >= filters.startDate && requestDate <= filters.endDate;
          else if (filters.startDate) return requestDate >= filters.startDate;
          else if (filters.endDate) return requestDate <= filters.endDate;
          return true;
        });
      }
      allRequests.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      const requestsWithCategories = await Promise.all(
        allRequests.map(async (item) => {
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
            if (categoryId) {
              const categoryDoc = await getDocument('requests_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, categoryName };
        })
      );
      setRequests(requestsWithCategories);
      const initialItems = requestsWithCategories.slice(0, requestsItemsPerPage);
      setPaginatedRequests(initialItems);
      setCurrentRequestsPage(1);
      setRequestsError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequestsError(err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchUserSurveys = async (filters = userSurveyFilters) => {
    if (!user && hasProfile === false) {
      setUserSurveys([]);
      setUserSurveysLoading(false);
      setUserSurveysError('No authenticated user');
      return;
    }
    try {
      setUserSurveysLoading(true);
      const surveysRef = collection(firestore, 'surveys');
      const userSurveysQuery = query(surveysRef, where('userId', '==', `/users/${user.uid}`));
      const snapshot = await getDocs(userSurveysQuery);
      let allSurveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (filters.statuses.length > 0) {
        allSurveys = allSurveys.filter(item => filters.statuses.includes(item.status));
      }
      if (filters.categories.length > 0) {
        allSurveys = allSurveys.filter(item => {
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
        allSurveys = allSurveys.filter(item => {
          const surveyDate = item.createdAt.toDate();
          if (filters.startDate && filters.endDate) return surveyDate >= filters.startDate && surveyDate <= filters.endDate;
          else if (filters.startDate) return surveyDate >= filters.startDate;
          else if (filters.endDate) return surveyDate <= filters.endDate;
          return true;
        });
      }
      allSurveys.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      const surveysWithVoteStatus = await Promise.all(
        allSurveys.map(async (item) => {
          const hasVoted = await checkIfUserVoted(item.id, user.uid);
          let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
          if (item.categoryId) {
            let categoryId;
            if (typeof item.categoryId === 'object' && item.categoryId.id) {
              categoryId = item.categoryId.id;
            } else if (typeof item.categoryId === 'string') {
              categoryId = item.categoryId.split('/').pop();
            }
            if (categoryId) {
              const categoryDoc = await getDocument('surveys_categories', categoryId);
              categoryName = categoryDoc?.name || categoryName;
            }
          }
          return { ...item, hasVoted, categoryName };
        })
      );
      setUserSurveys(surveysWithVoteStatus);
      const initialItems = surveysWithVoteStatus.slice(0, userSurveysItemsPerPage);
      setPaginatedUserSurveys(initialItems);
      setCurrentUserSurveysPage(1);
      setUserSurveysError(null);
    } catch (err) {
      console.error('Error fetching user surveys:', err);
      setUserSurveysError(err.message);
    } finally {
      setUserSurveysLoading(false);
    }
  };

  const fetchUserPetitions = async (filters = userPetitionFilters) => {
    if (!user && hasProfile === false) {
        setUserPetitions([]);
        setUserPetitionsLoading(false);
        setUserPetitionsError('No authenticated user');
        return;
    }
    try {
        setUserPetitionsLoading(true);
        const petitionsRef = collection(firestore, 'petitions');
        const userPetitionsQuery = query(petitionsRef, where('userId', '==', `/users/${user.uid}`));
        const snapshot = await getDocs(userPetitionsQuery);
        let allPetitions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (filters.statuses.length > 0) {
            allPetitions = allPetitions.filter(item => filters.statuses.includes(item.status));
        }
        if (filters.categories.length > 0) {
            allPetitions = allPetitions.filter(item => {
                if (!item.categoryId) return false;
                let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
                return filters.categories.includes(categoryId);
            });
        }
        if (filters.startDate || filters.endDate) {
            allPetitions = allPetitions.filter(item => {
                const petitionDate = item.createdAt.toDate();
                if (filters.startDate && filters.endDate) return petitionDate >= filters.startDate && petitionDate <= filters.endDate;
                else if (filters.startDate) return petitionDate >= filters.startDate;
                else if (filters.endDate) return petitionDate <= filters.endDate;
                return true;
            });
        }
        allPetitions.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        const petitionsWithSignStatus = await Promise.all(
            allPetitions.map(async (item) => {
                const hasSigned = await checkIfUserSigned(item.id, user.uid);
                let categoryName = { en: 'Unknown', ru: 'Неизвестно', kz: 'Белгісіз' };
                if (item.categoryId) {
                    let categoryId = typeof item.categoryId === 'string' ? item.categoryId.split('/').pop() : item.categoryId?.id;
                    if (categoryId) {
                        const categoryDoc = await getDocument('petitions_categories', categoryId);
                        categoryName = categoryDoc?.name || categoryName;
                    }
                }
                return { ...item, hasSigned, categoryName };
            })
        );

        setUserPetitions(petitionsWithSignStatus);
        const initialItems = petitionsWithSignStatus.slice(0, userPetitionsItemsPerPage);
        setPaginatedUserPetitions(initialItems);
        setCurrentUserPetitionsPage(1);
        setUserPetitionsError(null);
    } catch (err) {
        console.error('Error fetching user petitions:', err);
        setUserPetitionsError(err.message);
    } finally {
        setUserPetitionsLoading(false);
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

  const updateSurveyFilters = async (newFilters) => {
    setSurveyFilters(newFilters);
    await fetchSurveys(newFilters);
  };

  const updatePetitionFilters = async (newFilters) => {
    setPetitionFilters(newFilters);
    await fetchPetitions(newFilters);
  };

  const updateRequestFilters = async (newFilters) => {
    setRequestFilters(newFilters);
    await fetchRequests(newFilters);
  };

  const updateUserSurveyFilters = async (newFilters) => {
    setUserSurveyFilters(newFilters);
    await fetchUserSurveys(newFilters);
  };

  const updateUserPetitionFilters = async (newFilters) => {
    setUserPetitionFilters(newFilters);
    await fetchUserPetitions(newFilters);
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

  useEffect(() => {
    if (user && hasProfile === true) {
      Promise.all([
        fetchNews(),
        fetchEvents(),
        fetchSurveys(),
        fetchPetitions(),
        fetchRequests(),
        fetchUserSurveys(),
        fetchUserPetitions(),
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
    fetchRequests();
    fetchUserSurveys();
    fetchUserPetitions(),
    resetSearch();
    resetEventSearch();
    resetSurveySearch();
    resetPetitionSearch();
    resetRequestSearch();
    resetUserSurveySearch();
    resetUserPetitionSearch();
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
        loadMoreSurveys,
        paginatedSurveys,
        paginatedSurveySearchResults,
        isSurveysLoadingMore,
        searchSurveys,
        surveySearchResults,
        surveySearchLoading,
        surveySearchError,
        resetSurveySearch,
        isSurveySearchActive,
        surveyFilters,
        updateSurveyFilters,
        petitions,
        petitionsLoading,
        petitionsError,
        fetchPetitions,
        loadMorePetitions,
        paginatedPetitions,
        paginatedPetitionSearchResults,
        isPetitionsLoadingMore,
        searchPetitions,
        petitionSearchResults,
        petitionSearchLoading,
        petitionSearchError,
        resetPetitionSearch,
        isPetitionSearchActive,
        petitionFilters,
        updatePetitionFilters,
        requests,
        requestsLoading,
        requestsError,
        fetchRequests,
        loadMoreRequests,
        paginatedRequests,
        paginatedRequestSearchResults,
        isRequestsLoadingMore,
        searchRequests,
        requestSearchResults,
        requestSearchLoading,
        requestSearchError,
        resetRequestSearch,
        isRequestSearchActive,
        requestFilters,
        updateRequestFilters,
        userSurveys,
        userSurveysLoading,
        userSurveysError,
        fetchUserSurveys,
        loadMoreUserSurveys,
        paginatedUserSurveys,
        paginatedUserSurveySearchResults,
        isUserSurveysLoadingMore,
        searchUserSurveys,
        userSurveySearchResults,
        userSurveySearchLoading,
        userSurveySearchError,
        resetUserSurveySearch,
        isUserSurveySearchActive,
        userSurveyFilters,
        updateUserSurveyFilters,
        userPetitions,
    userPetitionsLoading,
    userPetitionsError,
    fetchUserPetitions,
    loadMoreUserPetitions,
    paginatedUserPetitions,
    paginatedUserPetitionSearchResults,
    isUserPetitionsLoadingMore,
    searchUserPetitions,
    userPetitionSearchResults,
    userPetitionSearchLoading,
    userPetitionSearchError,
    resetUserPetitionSearch,
    isUserPetitionSearchActive,
    userPetitionFilters,
    updateUserPetitionFilters,
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