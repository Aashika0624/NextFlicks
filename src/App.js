import { useState, useEffect, useRef } from 'react';
import StarRating from './star';
import { genresList } from './data/genreList';
import { useElevenWhereAreYou } from './useElevenWhereAreYou';
import { cosineSimilaritySVG, styleCSSVG } from './data/cosineSimilaritySVG';
import { roundItUp } from './functions/roundItUp';

/*tasks
- watched list (if watched, remove from the list)
- rating system (?)
- the search bar and the genre selection --> overflowing the screen when half
- genre multiple selection
- 'select genre' colour change - select genre should have a lighter colour to encourage users to specify genre.
*/

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentGenre, setcurrentGenre] = useState('');
  const [thisTVShow, setThisTVShow] = useState({});
  // const [isDataUpdating, setIsDataUpdating] = useState(false);

  // retrieval model initilisation
  const { tvShows, isLoading, throwError } = useElevenWhereAreYou(
    searchQuery,
    currentGenre,
    setThisTVShow
  );

  const displayShowDetails = (tvShow) => {
    setThisTVShow(tvShow);
  };

  useEffect(() => {
    if (!thisTVShow.name) {
      document.title = `Nextflicks`;
    } else {
      document.title = `Nextflicks | ${thisTVShow.name}`;
    }

    // return function () {
    //   document.title = 'Nextflicks';
    // };
  }, [thisTVShow]);

  return (
    <>
      <NavBar>
        <Logo />
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
        >
          {' '}
          <CategoryFilter
            currentGenre={currentGenre}
            setcurrentGenre={setcurrentGenre}
            isLoading={isLoading}
          />
        </SearchBar>
      </NavBar>
      {throwError ? (
        <ThrowItThrowThatError />
      ) : (
        <Main>
          <ContainerBox style={{ width: '47rem' }}>
            {isLoading ? (
              <PageLoader />
            ) : (
              <SearchResults
                tvShows={tvShows}
                thisTVShow={thisTVShow}
                displayShowDetails={displayShowDetails}
              />
            )}
          </ContainerBox>
          <ContainerBox style={{ width: '36rem' }}>
            <ThisTVShow thisTVShow={thisTVShow} />
            {/* <WatchedSummary watched={watched} />
            <WatchedShowsList watched={watched} /> */}
          </ContainerBox>
        </Main>
      )}
      <NumberResults tvShows={tvShows} />
      {/* <footer>&copy; Built by Anonymous Student </footer> */}
      <footer> Group 7 </footer>
    </>
  );
}

function ThrowItThrowThatError() {
  return <p className="loader">Connection lost...Try again!</p>;
}

function PageLoader() {
  return <p className="loader">Loading...</p>;
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <h1 style={{ color: '#E50914' }}>Nextflicks</h1>
    </div>
  );
}

function NumberResults({ tvShows }) {
  let numberResult;
  if (tvShows.length > 1) {
    numberResult = (
      <em>
        <strong>{tvShows.length}</strong> shows found
      </em>
    );
  } else if (tvShows.length === 1) {
    numberResult = (
      <em>
        <strong>{tvShows.length}</strong> show found
      </em>
    );
  } else {
    numberResult = 'No match';
  }

  return (
    <div className="numresult-grid-container">
      <p className="num-results">{numberResult}</p>
    </div>
  );
}

function SearchBar({ searchQuery, setSearchQuery, children, isLoading }) {
  const focusEleven = useRef(null);

  useEffect(() => {
    // console.log(focusEleven.current)
    focusEleven.current.focus();
  }, []);

  useEffect(() => {
    function callback(e) {
      if (e.code === 'Enter') {
        focusEleven.current.focus();
        setSearchQuery('');
      }
    }
    document.addEventListener('keydown', callback);
    return () => document.addEventListener('keydown', callback);
  }, [searchQuery]);

  return (
    <div className="search-genre">
      <input
        type="text"
        placeholder="Search TV shows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search"
        style={{
          backgroundColor: `${isLoading ? '#404040' : '#44403c'}`,
        }}
        ref={focusEleven}
      />
      {children}
    </div>
  );
}

function CategoryFilter({ currentGenre, setcurrentGenre, isLoading }) {
  return (
    <>
      <select
        value={currentGenre}
        onChange={(e) => setcurrentGenre(e.target.value)}
        disabled={isLoading}
        className="search"
        style={{
          width: '19rem',
          backgroundColor: `${isLoading ? '#404040' : '#44403c'}`,
        }}
      >
        <option key="" value="" disabled>
          Select Genre:
        </option>
        <option key="all" value="all">
          All
        </option>
        {Object.entries(genresList).map(([key, value]) => (
          <Categories key={key} genreID={key} genre={value.genre} />
        ))}
      </select>
    </>
  );
}

function Categories({ genreID, genre }) {
  return <option value={genreID}>{genre}</option>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ContainerBox({ children, style }) {
  return (
    <div className="box" style={style}>
      {children}
    </div>
  );
}

function SearchResults({ tvShows, thisTVShow, displayShowDetails }) {
  return (
    <ul className="list list-movies">
      {tvShows?.map((tvShow) => (
        <TVShow
          tvShow={tvShow}
          thisTVShow={thisTVShow}
          key={tvShow.id}
          displayShowDetails={displayShowDetails}
        />
      ))}
    </ul>
  );
}

function TVShow({ tvShow, thisTVShow, displayShowDetails }) {
  return (
    <li
      onClick={() => displayShowDetails(tvShow)}
      style={tvShow.id === thisTVShow.id ? { backgroundColor: '#44403c' } : {}}
    >
      <img
        src={
          tvShow.poster_path
            ? `https://image.tmdb.org/t/p/original/${tvShow.poster_path}`
            : ''
        }
        alt={`${tvShow.name} artwork`}
      />
      <h3>{tvShow.name}</h3>
      <div className="tvshow-result-detail">
        <p>
          <span>{tvShow.first_air_date.slice(0, 4)}</span>
          <span>⭐️ {roundItUp(tvShow.vote_average, 1)}</span>
          <span> 🔴 {roundItUp(tvShow.cosine_similarity, 2)}</span>
        </p>
      </div>
    </li>
  );
}

function ThisTVShow({ thisTVShow }) {
  if (Object.keys(thisTVShow).length === 0) {
    return <div className="loader">No TV show selected</div>;
  }
  const genresMap = thisTVShow.genre_ids.map((genreid, index) => (
    <span
      key={index}
      className="genre-style"
      style={{
        backgroundColor: `${genresList[genreid].colour}`,
      }}
    >
      <span
        key={index}
        className="genre-style"
        style={{
          margin: '1.2rem',
          whiteSpace: 'nowrap',
          color: '#FFFF',
        }}
      >
        {genresList[genreid].genre}
      </span>
    </span>
  ));

  return (
    <div className="details">
      <header>
        <img
          className="header-background-image "
          src={
            thisTVShow.poster_path
              ? `https://image.tmdb.org/t/p/original/${thisTVShow.poster_path}`
              : ''
          }
          alt={`${thisTVShow.name} artwork`}
        />
        <div className="image-container">
          {' '}
          <img
            src={
              thisTVShow.poster_path
                ? `https://image.tmdb.org/t/p/original/${thisTVShow.poster_path}`
                : ''
            }
            alt={`${thisTVShow.name} artwork`}
            className="centered-image"
          />{' '}
        </div>
      </header>
      <div className="details-overview">
        <h2>{thisTVShow.name}</h2>
        <p>
          <span>{thisTVShow.first_air_date.slice(0, 4)}</span> &bull;
          {genresMap}
        </p>
        <p>
          <StarRating
            size={22}
            maxRating={10}
            defaultRating={thisTVShow.vote_average}
          />
        </p>
        <p>
          <em style={{ color: '#a8a29e' }}>
            cosine similarity: {roundItUp(thisTVShow.cosine_similarity * 1, 5)}
          </em>
        </p>
        <p>
          <em style={{ color: '#a8a29e' }}>{thisTVShow.overview}</em>
        </p>
      </div>
    </div>
  );
}
