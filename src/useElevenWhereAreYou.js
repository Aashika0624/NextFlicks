import { useState, useEffect } from 'react';
import { applyFilterOtherThanVSM } from './filtersOtherThanVSM/otherFilters';
import { postPath, serverPort } from './data/postRequest';
import { filterByGenre } from './filtersOtherThanVSM/genreFilter';
import { sortByRatingOrPopularityOrYear } from './filtersOtherThanVSM/sorter';

export function useElevenWhereAreYou(searchQuery, currentGenre, setThisTVShow) {
  const [tvShows, setTVShows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [throwError, setThrowError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    setIsLoading(true);

    const fetchTVShowsData = async () => {
      try {
        // step 1: When the user types in a search query, this part of the code sends a request (called 'POST request') to Python ir_model.py (more specifically to this URL: `http://localhost:5000/retrieveTVShows`) to calculate cosine similarity of the tv shows given the query.
        const response = await fetch(
          `http://localhost:${serverPort}/${postPath}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ query: searchQuery }),
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`ERROR: ${response.status}`);
        }

        // Step 3: Javascript now receives back the data sent by Python in Step 2 here and stores it in a variable called 'tvShowsFiltered'
        let tvShowsFiltered = await response.json();

        if (!Array.isArray(tvShowsFiltered)) {
          console.error('Fetched data not an array though!?', tvShowsFiltered);
          tvShowsFiltered = [];
        }

        // Step 4: Now Javascript immediately sorts the received data (tvShowsFiltered) based on rating (better rated shows rank at the top). If two or more tv shows have the same rating scores, then this function sorts by 'poppularity'. If the popularity scores are also identical, then it sorts by the release year. More information on this function, refer to sorter.js in filtersOtherThanVSM folder.
        tvShowsFiltered = sortByRatingOrPopularityOrYear(tvShowsFiltered);

        // Step 5: Once the shows have been sorted by rating, javascript now filters shows based on the genre. If the user has selected a specific genre, then only the tv shows in the specified genre will be singled out by this function. If the user does not specify genre, 'currentGenre' will automatically be set to 'all' and all tv shows will be displayed. More information on this function, please check genreFilter.js in filtersOtherThanVSM folder.
        tvShowsFiltered = filterByGenre(tvShowsFiltered, currentGenre);

        // Step 6: Finally, this funcitons mico manages our tv show filters one last time to refine and ensure that our retrieval models retrieve models correctly without any errors. It checks whether cosine similarity calculation is working properly and then re-sorts the shows again based on cosine similairty. More information, please check otherFilters.js in filtersOtherThanVSM folder. This completes the retrieving process. Once the retrieving model has been completed, javascript sends back the now filtered & sorted tv shows to the main App.js function to display them on the application.

        if (searchQuery !== '') {
          tvShowsFiltered = applyFilterOtherThanVSM(
            tvShowsFiltered,
            searchQuery
          );
        }

        setTVShows(tvShowsFiltered);
        if (tvShowsFiltered.length > 0) {
          setThisTVShow(tvShowsFiltered[0]);
        } else {
          setThisTVShow({});
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setThrowError(true);
          console.error(`Failed to fetch data: ${error.message}`);
        } else {
          console.log('Eleven, abort! abort!');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTVShowsData();

    return () => {
      abortController.abort();
    };
  }, [searchQuery, currentGenre]);

  return { tvShows, isLoading, throwError };
}
