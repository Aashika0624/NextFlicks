import pandas as pd
import json
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Flask set up to allow for post requests sent by javascript
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

app= Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


filePath = './data/tv_shows_1000.json'

class EnhancedVSMModel:
    def __init__(self, data_path):
        self.data_path = data_path
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        self.genre_mapping = {
            10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
            99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
            9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
            10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
        }
        self.svd = TruncatedSVD(n_components=100) 
        self._load_data()
        self._preprocess_data()
        self._vectorize()

    def _load_data(self):
        with open(self.data_path) as f:
            data = json.load(f)
        self.df = pd.DataFrame(data)
        self.df['genre_names'] = self.df['genre_ids'].apply(lambda x: [self.genre_mapping.get(id, 'Other') for id in x])

    def _preprocess_text(self, text):
        text = re.sub(r'[^\w\s]', '', text.lower())
        words = nltk.word_tokenize(text)
        words = [word for word in words if word not in self.stop_words]
        words = [self.lemmatizer.lemmatize(word) for word in words]
        return ' '.join(words)

    def _preprocess_data(self):
        self.df['combined_text'] = self.df['name'] + ' ' + self.df['genre_names'].astype(str) + ' ' + self.df['overview']
        self.df['processed_text'] = self.df['combined_text'].apply(self._preprocess_text)

    def _vectorize(self):
        tfidf_matrix_raw = self.vectorizer.fit_transform(self.df['processed_text'])
        self.tfidf_matrix = self.svd.fit_transform(tfidf_matrix_raw)  # Apply SVD


    def search(self, query, top_n=500):
        preprocessed_query = self._preprocess_text(query)
        query_vector_raw = self.vectorizer.transform([preprocessed_query])
        query_vector = self.svd.transform(query_vector_raw)  # Reduce query vector dimensions
        cosine_similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        top_indices = cosine_similarities.argsort()[-top_n:][::-1]
        results_with_scores = self.df.iloc[top_indices]
        results_with_scores['cosine_similarity'] = cosine_similarities[top_indices]
        return results_with_scores.to_dict(orient='records')


vsm_model = EnhancedVSMModel(filePath)


# Step 2: Python, at this url (`http://localhost:5000/retrieveTVShows`), receives the request (POST request) sent by javascript in Step 1, calculates cosine similarity of all the tv shows in the dataset for a given query, and finally returns the top 1,000 tv shows with highest cosine similarity scores. The dataformat of the returned data is as follows:   
# {
    # "adult": false,
    # "backdrop_path": "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    # "genre_ids": [10765, 9648, 18],
    # "id": 66732,
    # "origin_country": ["US"],
    # "original_language": "en",
    # "original_name": "Stranger Things",
    # "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    # "popularity": 498.395,
    # "poster_path": "/rbnuP7hlynAMLdqcQRCpZW9qDkV.jpg",
    # "first_air_date": "2016-07-15",
    # "name": "Stranger Things",
    # "vote_average": 8.615,
    # "vote_count": 16805,
    # "processed_text": "qwertyyu",
    # "cosine_similarity": 0.44
#   },
# Python returns the data to javascript for further filtering and sorting. 

@app.route('/retrieveTVShows', methods=['POST'])
def retrieveTVShows():
    query = request.json['query']
    search_results = vsm_model.search(query, top_n=1000)
    return jsonify(search_results)


if __name__ == "__main__":
    app.run(debug=True)




