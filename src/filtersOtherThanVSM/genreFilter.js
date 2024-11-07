// The Nextflicks app has the feature to select genre. If user therefore selects a specific genre, this function singles out tv shows in the given genre. If not selected, then this function automatically returns all tv shows.

export function filterByGenre(tvShowsFiltered, currentGenre) {
  if (currentGenre !== 'all' && currentGenre !== '') {
    return tvShowsFiltered.filter((show) =>
      show.genre_ids.includes(parseInt(currentGenre, 10))
    );
  }
  return tvShowsFiltered;
}
