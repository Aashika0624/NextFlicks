import { roundItUp } from '../functions/roundItUp';

// this function sorts tv shows by voters' average rating (vote_average), however, if 2 or more tv shows have the same rating, then they will be ranked according to show's popularity ("popularity"). If the popularity scores are also the same, then release year (latest shows come first)

export function sortByRatingOrPopularityOrYear(tvShowsFiltered) {
  return tvShowsFiltered.sort((a, b) => {
    const ratingDifference =
      roundItUp(b.vote_average, 2) - roundItUp(a.vote_average, 2);
    const popularityDifference = b.popularity - a.popularity;
    const yearDifference =
      Number(b.first_air_date.slice(0, 4)) -
      Number(a.first_air_date.slice(0, 4));

    if (ratingDifference !== 0) {
      return ratingDifference;
    } else {
      if (popularityDifference !== 0) {
        return popularityDifference;
      } else {
        return yearDifference;
      }
    }
  });
}
