import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFirestore } from "../hooks/useFirestore";
import {
    doc,
    updateDoc,
    collection,
    query,
    where,
    onSnapshot,
} from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user, hasProfile } = useAuth();
    const { getDocument } = useFirestore();

    // Refs для хранения unsubscribe функций
    const unsubscribeEventsRef = useRef(null);
    const unsubscribeCategoriesRef = useRef(null);

    // Events states
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [paginatedEvents, setPaginatedEvents] = useState([]);
    const [paginatedEventSearchResults, setPaginatedEventSearchResults] =
        useState([]);
    const [currentEventsPage, setCurrentEventsPage] = useState(1);
    const [currentEventSearchPage, setCurrentEventSearchPage] = useState(1);
    const [isEventsLoadingMore, setIsEventsLoadingMore] = useState(false);
    const eventsItemsPerPage = 4;

    // Events search states
    const [eventSearchResults, setEventSearchResults] = useState([]);
    const [eventSearchLoading, setEventSearchLoading] = useState(false);
    const [eventSearchError, setEventSearchError] = useState(null);
    const [isEventSearchActive, setIsEventSearchActive] = useState(false);

    // Filter states for events
    const [eventFilters, setEventFilters] = useState({
        startDate: null,
        endDate: null,
        categories: [],
    });

    // Кэш для категорий чтобы избежать повторных запросов
    const [categoriesCache, setCategoriesCache] = useState({});

    // Функция для получения категории с кэшированием
    const getCategoryName = async (categoryId) => {
        if (!categoryId)
            return { en: "Unknown", ru: "Неизвестно", kz: "Белгісіз" };

        let actualCategoryId;
        if (typeof categoryId === "object" && categoryId.id) {
            actualCategoryId = categoryId.id;
        } else if (typeof categoryId === "string") {
            actualCategoryId = categoryId.split("/").pop();
        } else {
            return { en: "Unknown", ru: "Неизвестно", kz: "Белгісіз" };
        }

        if (categoriesCache[actualCategoryId]) {
            return categoriesCache[actualCategoryId];
        }

        try {
            const categoryDoc = await getDocument(
                "events_categories",
                actualCategoryId
            );
            const categoryName = categoryDoc?.name || {
                en: "Unknown",
                ru: "Неизвестно",
                kz: "Белгісіз",
            };
            setCategoriesCache((prev) => ({
                ...prev,
                [actualCategoryId]: categoryName,
            }));
            return categoryName;
        } catch (error) {
            console.error("Error fetching category:", error);
            return { en: "Unknown", ru: "Неизвестно", kz: "Белгісіз" };
        }
    };

    // Функция для применения фильтров к событиям
    const applyFiltersToEvents = (eventsData, filters) => {
        let filteredEvents = [...eventsData];

        if (filters.categories && filters.categories.length > 0) {
            filteredEvents = filteredEvents.filter((item) => {
                if (!item.categoryId) return false;
                let categoryId;
                if (typeof item.categoryId === "object" && item.categoryId.id) {
                    categoryId = item.categoryId.id;
                } else if (typeof item.categoryId === "string") {
                    categoryId = item.categoryId.split("/").pop();
                } else {
                    return false;
                }
                return filters.categories.includes(categoryId);
            });
        }

        if (filters.startDate || filters.endDate) {
            filteredEvents = filteredEvents.filter((item) => {
                const eventDate = item.date.toDate();
                if (filters.startDate && filters.endDate) {
                    return (
                        eventDate >= filters.startDate &&
                        eventDate <= filters.endDate
                    );
                } else if (filters.startDate) {
                    return eventDate >= filters.startDate;
                } else if (filters.endDate) {
                    return eventDate <= filters.endDate;
                }
                return true;
            });
        }

        return filteredEvents.sort((a, b) => a.date.toDate() - b.date.toDate());
    };

    // Функция для применения поиска к событиям
    const applySearchToEvents = (eventsData, searchText, language = "en") => {
        if (!searchText) return eventsData;

        const searchLower = searchText.toLowerCase();
        return eventsData.filter((item) => {
            const titleContains = item.title[language]
                ?.toLowerCase()
                .includes(searchLower);
            const descriptionContains = item.description[language]
                ?.toLowerCase()
                .includes(searchLower);
            return titleContains || descriptionContains;
        });
    };

    // Функция для обновления пагинированных событий
    const updatePaginatedEvents = (filteredEvents) => {
        const startIndex = (currentEventsPage - 1) * eventsItemsPerPage;
        const endIndex = startIndex + eventsItemsPerPage;
        const paginatedItems = filteredEvents.slice(0, endIndex);
        setPaginatedEvents(paginatedItems);
    };

    // Функция для обновления пагинированных результатов поиска
    const updatePaginatedSearchResults = (searchResults) => {
        const initialItems = searchResults.slice(0, eventsItemsPerPage);
        setPaginatedEventSearchResults(initialItems);
        setCurrentEventSearchPage(1);
    };

    const loadMoreEvents = () => {
        if (isEventSearchActive) {
            const startIndex = currentEventSearchPage * eventsItemsPerPage;
            if (startIndex >= eventSearchResults.length) return;
            setIsEventsLoadingMore(true);
            setTimeout(() => {
                const newItems = eventSearchResults.slice(
                    startIndex,
                    startIndex + eventsItemsPerPage
                );
                setPaginatedEventSearchResults((prev) => [
                    ...prev,
                    ...newItems,
                ]);
                setCurrentEventSearchPage((prev) => prev + 1);
                setIsEventsLoadingMore(false);
            }, 500);
        } else {
            const startIndex = currentEventsPage * eventsItemsPerPage;
            if (startIndex >= events.length) return;
            setIsEventsLoadingMore(true);
            setTimeout(() => {
                const newItems = events.slice(
                    startIndex,
                    startIndex + eventsItemsPerPage
                );
                setPaginatedEvents((prev) => [...prev, ...newItems]);
                setCurrentEventsPage((prev) => prev + 1);
                setIsEventsLoadingMore(false);
            }, 500);
        }
    };

    const searchEvents = async (
        searchText,
        language = "en",
        filters = eventFilters
    ) => {
        if ((!user && hasProfile === false) || !searchText) {
            setEventSearchResults([]);
            setIsEventSearchActive(false);
            return [];
        }

        try {
            setEventSearchLoading(true);
            setIsEventSearchActive(true);

            // Применяем поиск и фильтры к текущим событиям
            let filteredEvents = applySearchToEvents(
                events,
                searchText,
                language
            );
            filteredEvents = applyFiltersToEvents(filteredEvents, filters);

            // Добавляем категории к отфильтрованным событиям
            const eventsWithCategories = await Promise.all(
                filteredEvents.map(async (item) => {
                    const categoryName = await getCategoryName(item.categoryId);
                    return { ...item, categoryName };
                })
            );

            setEventSearchResults(eventsWithCategories);
            updatePaginatedSearchResults(eventsWithCategories);
            setEventSearchError(null);
            return eventsWithCategories;
        } catch (err) {
            console.error("Error searching events:", err);
            setEventSearchError(err.message);
            return [];
        } finally {
            setEventSearchLoading(false);
        }
    };

    const resetEventSearch = () => {
        setEventSearchResults([]);
        setPaginatedEventSearchResults([]);
        setCurrentEventSearchPage(1);
        setIsEventSearchActive(false);
        setEventSearchError(null);
    };

    // Основная функция для установки слушателя событий
    const setupEventsListener = async (filters = eventFilters) => {
        if (!user || hasProfile === false) {
            setEvents([]);
            setEventsLoading(false);
            setEventsError("No authenticated user");
            return;
        }

        try {
            setEventsLoading(true);
            const userDoc = await getDocument("users", user.uid);
            const cityKey = userDoc?.cityKey;

            if (!cityKey) {
                throw new Error("User city not found");
            }

            // Отписываемся от предыдущего слушателя если он есть
            if (unsubscribeEventsRef.current) {
                unsubscribeEventsRef.current();
            }

            const eventsRef = collection(firestore, "events");
            const cityEventsQuery = query(
                eventsRef,
                where("cityKey", "==", cityKey)
            );

            // Устанавливаем real-time слушатель
            unsubscribeEventsRef.current = onSnapshot(
                cityEventsQuery,
                async (snapshot) => {
                    try {
                        const allEvents = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }));

                        // Применяем фильтры
                        const filteredEvents = applyFiltersToEvents(
                            allEvents,
                            filters
                        );

                        // Добавляем категории к событиям
                        const eventsWithCategories = await Promise.all(
                            filteredEvents.map(async (item) => {
                                const categoryName = await getCategoryName(
                                    item.categoryId
                                );
                                return { ...item, categoryName };
                            })
                        );

                        setEvents(eventsWithCategories);
                        updatePaginatedEvents(eventsWithCategories);
                        setEventsError(null);
                        setEventsLoading(false);

                        // Если активен поиск, обновляем результаты поиска
                        if (isEventSearchActive) {
                            // Получаем текущий поисковый запрос из состояния или передаем пустую строку
                            // В реальной реализации нужно сохранять текущий поисковый запрос в состоянии
                            const searchResults = applySearchToEvents(
                                eventsWithCategories,
                                "",
                                "en"
                            );
                            const searchWithCategories = await Promise.all(
                                searchResults.map(async (item) => {
                                    const categoryName = await getCategoryName(
                                        item.categoryId
                                    );
                                    return { ...item, categoryName };
                                })
                            );
                            setEventSearchResults(searchWithCategories);
                            updatePaginatedSearchResults(searchWithCategories);
                        }
                    } catch (err) {
                        console.error("Error processing events snapshot:", err);
                        setEventsError(err.message);
                        setEventsLoading(false);
                    }
                },
                (error) => {
                    console.error("Events listener error:", error);
                    setEventsError(error.message);
                    setEventsLoading(false);
                }
            );
        } catch (err) {
            console.error("Error setting up events listener:", err);
            setEventsError(err.message);
            setEventsLoading(false);
        }
    };

    // Функция для установки слушателя категорий
    const setupCategoriesListener = () => {
        if (unsubscribeCategoriesRef.current) {
            unsubscribeCategoriesRef.current();
        }

        const categoriesRef = collection(firestore, "events_categories");

        unsubscribeCategoriesRef.current = onSnapshot(
            categoriesRef,
            (snapshot) => {
                const newCategoriesCache = {};
                snapshot.docs.forEach((doc) => {
                    newCategoriesCache[doc.id] = doc.data().name || {
                        en: "Unknown",
                        ru: "Неизвестно",
                        kz: "Белгісіз",
                    };
                });
                setCategoriesCache(newCategoriesCache);
            },
            (error) => {
                console.error("Categories listener error:", error);
            }
        );
    };

    const updateEventFilters = async (newFilters) => {
        setEventFilters(newFilters);
        await setupEventsListener(newFilters);
    };

    // Эффект для установки слушателей при авторизации пользователя
    useEffect(() => {
        if (user && hasProfile === true) {
            setupEventsListener();
            setupCategoriesListener();
            // Здесь можно добавить другие слушатели для news, surveys, petitions, etc.
        }

        // Cleanup function для отписки от слушателей
        return () => {
            if (unsubscribeEventsRef.current) {
                unsubscribeEventsRef.current();
            }
            if (unsubscribeCategoriesRef.current) {
                unsubscribeCategoriesRef.current();
            }
        };
    }, [user, hasProfile]);

    // Эффект для обновления фильтров
    useEffect(() => {
        if (user && hasProfile === true) {
            setupEventsListener(eventFilters);
        }
    }, [eventFilters]);

    const refreshAllData = () => {
        setupEventsListener();
        resetEventSearch();
    };

    // Функция для обновления события (пример использования updateDoc)
    const updateEvent = async (eventId, updates) => {
        try {
            const eventRef = doc(firestore, "events", eventId);
            await updateDoc(eventRef, updates);
            // Обновление произойдет автоматически через onSnapshot
        } catch (error) {
            console.error("Error updating event:", error);
            throw error;
        }
    };

    return (
        <DataContext.Provider
            value={{
                events,
                eventsLoading,
                eventsError,
                setupEventsListener,
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
                refreshAllData,
                updateEvent,
                categoriesCache,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
