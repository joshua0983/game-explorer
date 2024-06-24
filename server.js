const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/game_explorer');

// Define the Game schema for MongoDB
const gameSchema = new mongoose.Schema({
  gameId: Number,
  videoUrl: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});

// Create the Game model from the schema
const Game = mongoose.model('Game', gameSchema);


// Function to get an access token from Twitch
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

// Function to fetch a YouTube video URL for a given game name
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

// API endpoint to search for games
app.get('/api/search', async (req, res) => {
  try {
    const searchQuery = req.query.q || ''; // Use the query parameter 'q' or default to an empty string
    console.log(`Searching for games with query: ${searchQuery}`);

    const ACCESS_TOKEN = await getToken();
    if (!ACCESS_TOKEN) {
      return res.status(500).send('Error fetching access token');
    }

    let allGames = [];
    let offset = 0;
    const limit = 5;
    let hasMore = true;

    // Loop to paginate through the IGDB API results
    while (hasMore) {
      const queryData = `fields id,name,genres.name,summary; search "${searchQuery}"; limit ${limit}; offset ${offset};`;
      console.log(`Querying IGDB with data: ${queryData}`);

      const response = await axios({
        url: 'https://api.igdb.com/v4/games',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Client-ID': CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        data: queryData,
      });

      console.log(`IGDB API Response for offset ${offset}:`, JSON.stringify(response.data, null, 2));

      const games = response.data;
      allGames = allGames.concat(games);

      if (games.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    const updatedGames = [];

    for (const game of allGames) {
      let existingGame = await Game.findOne({ gameId: game.id });
      let videoUrl = existingGame ? existingGame.videoUrl : await fetchYouTubeVideo(game.name);

      // Save new game to the database if it doesn't exist
      if (!existingGame) {
        existingGame = new Game({
          gameId: game.id,
          videoUrl: videoUrl,
          likes: 0, 
          dislikes: 0 
        });
        await existingGame.save();
      }

      // Prepare the game data for the response
      const gameData = {
        id: game.id,
        name: game.name,
        genres: game.genres ? game.genres.map((genre) => genre.name) : [],
        summary: game.summary,
        videoUrl: videoUrl,
        likes: existingGame.likes,
        dislikes: existingGame.dislikes,
      };

      updatedGames.push(gameData);
    }

    console.log(`Total games found: ${allGames.length}`);
    res.json(updatedGames);
  } catch (error) {
    console.error('Error searching games:', error.message);
    res.status(500).send('Error searching games');
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'game-explorer-client/build')));

// Catch-all handler for any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'game-explorer-client/build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log('Server is running on port: ' + port);
});