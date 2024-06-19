const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/game_explorer');

const gameSchema = new mongoose.Schema({
  gameId: Number,
  name: String,
  genres: [String],
  summary: String,
  videoUrl: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});

const Game = mongoose.model('Game', gameSchema);

const getToken = async () => {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });
    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

const fetchYouTubeVideo = async (gameName) => {
  const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
  try {
    console.log(`Fetching YouTube video for: ${gameName}`);
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: `${gameName} game`,
        maxResults: 1,
        type: 'video',
        key: YOUTUBE_API_KEY,
      },
    });

    console.log(`YouTube API response for ${gameName}:`, response.data);

    if (response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log(`Fetched YouTube video for ${gameName}: ${videoUrl}`);
      return videoUrl;
    } else {
      console.log(`No videos found for ${gameName}`);
      return 'No videos found';
    }
  } catch (error) {
    console.error(`Error fetching YouTube video for ${gameName}:`, error);
    return 'Error';
  }
};

app.get('/', (req, res) => {
  res.send('Welcome to the Game Explorer API');
});

app.get('/api/games', async (req, res) => {
  try {
    const ACCESS_TOKEN = await getToken();
    if (!ACCESS_TOKEN) {
      return res.status(500).send('Error fetching access token');
    }

    const response = await axios({
      url: 'https://api.igdb.com/v4/games',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': CLIENT_ID,
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      data: 'fields id,name,genres.name,summary; limit 5;',
    });

    console.log('IGDB API Response:', JSON.stringify(response.data, null, 2));

    const games = response.data;
    const updatedGames = [];
    for (const game of games) {
      const genres = game.genres ? game.genres.map((genre) => genre.name) : [];
      const existingGame = await Game.findOne({ gameId: game.id });
      let videoUrl;
      if (existingGame) {
        videoUrl = existingGame.videoUrl;
        console.log(`Using existing game for ${game.name}`);
        if (!videoUrl || videoUrl === 'No videos found' || videoUrl === 'Error') {
          console.log(`Fetching new video URL for ${game.name}`);
          videoUrl = await fetchYouTubeVideo(game.name);
          existingGame.videoUrl = videoUrl;
          await existingGame.save();
        }
      } else {
        videoUrl = await fetchYouTubeVideo(game.name);
        console.log(`Fetched video URL for ${game.name}: ${videoUrl}`);
        const newGame = new Game({
          gameId: game.id,
          name: game.name,
          genres: genres,
          summary: game.summary,
          videoUrl: videoUrl,
        });
        console.log(`Saving new game: ${JSON.stringify(newGame, null, 2)}`);
        await newGame.save();
      }
      updatedGames.push({
        id: game.id,
        name: game.name,
        genres: genres,
        summary: game.summary,
        videoUrl: videoUrl,
        likes: existingGame ? existingGame.likes : 0,
        dislikes: existingGame ? existingGame.dislikes : 0,
      });
    }
    res.json(updatedGames);
  } catch (error) {
    console.error('Error fetching games:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching games');
  }
});

app.listen(port, () => {
  console.log('Server is running on port: ' + port);
});
