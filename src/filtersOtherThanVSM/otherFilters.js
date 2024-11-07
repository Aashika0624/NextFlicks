import { roundItUp } from '../functions/roundItUp';

// When user query is incomplete such as 'blu' (when the supposed query is 'blue') none of tv shows will have cosine similarity above 0. In a nutshell, until user finishes typing in at least one complete word like 'blue', vector space model does/can not return meaningful cosine similarity scores which are above 0. Hence, this function specifies that, when all the tv shows have cosine similarity scores of 0 (that is query word is only half finished/incomplete), then the function simply looks for tv shows that have the incomplete query in either the title (name) or the overview. However, if the incompelte query is less than 4 characters, it only looks for tv shows whose title contains the incomplete query. It's only when the incomplete query exceeds 4 characters that looks for both name and overview. Once user has finished typing at least 1 complete word, at least one tv show will have cosine similaity score above 0. If that's the case, tv shows with cosine similarity above 0 will be singled out and sorted based on the score.

export function applyFilterOtherThanVSM(tvShowsFiltered, searchQuery) {
  const hasCSAboveZero = tvShowsFiltered.some(
    (show) => roundItUp(show.cosine_similarity, 10) > 0
  );

  if (!hasCSAboveZero) {
    if (searchQuery.length < 4) {
      return tvShowsFiltered.filter((show) =>
        show.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return tvShowsFiltered.filter((show) =>
        show.processed_text.includes(searchQuery.toLowerCase())
      );
    }
  } else {
    tvShowsFiltered = tvShowsFiltered.filter(
      (show) => roundItUp(show.cosine_similarity, 10) > 0
    );
    return tvShowsFiltered.sort(
      (a, b) => b.cosine_similarity - a.cosine_similarity
    );
  }
}
