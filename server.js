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
mongoose.connect('mongodb+srv://joshua0983:jjworkicho@game-explorer.gjcmvrj.mongodb.net/?retryWrites=true&w=majority&appName=game-explorer');



// Define the Game schema for MongoDB
const gameSchema = new mongoose.Schema({
  gameId: Number,
  name: String,
  aggregatedRating: Number,
  platforms: [String],
  screenshots: [String],
  firstReleaseDate: Number,
  storyline: String,
  videos: [String],
  coverUrl: String,
  summary: String,
  genres: [String],
  gameModes: [String],
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

// Function to fetch a cover image URL for a given game ID
const fetchGameCover = async (gameId, ACCESS_TOKEN) => {
  const IGDB_API_URL = 'https://api.igdb.com/v4/covers';
  try {
    console.log(`Fetching cover for game ID: ${gameId}`);
    const response = await axios({
      url: IGDB_API_URL,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': CLIENT_ID,
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      data: `fields url; where game = ${gameId};`,
    });

    console.log(`IGDB API response for cover:`, response.data);

    if (response.data.length > 0) {
      // Change the image size from t_thumb to t_cover_big
      const coverUrl = response.data[0].url.replace('t_thumb', 't_cover_big');
      console.log(`Fetched cover for game ID ${gameId}: ${coverUrl}`);
      return coverUrl;
    } else {
      console.log(`No cover found for game ID: ${gameId}`);
      return 'No cover found';
    }
  } catch (error) {
    console.error(`Error fetching cover for game ID ${gameId}:`, error);
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

    let existingGames = await Game.find({ name: new RegExp(searchQuery, 'i') }).limit(12);
    existingGames = existingGames.sort((a, b) => (b.aggregatedRating || 0) - (a.aggregatedRating || 0));

    if (existingGames.length >= 12) {
      return res.json(existingGames);
    }

    const allGames = [];
    const limit = 12;
    let offset = 0;
    let hasMore = true;

    // Loop to paginate through the IGDB API results
    while (hasMore && allGames.length + existingGames.length < limit) {
      const queryData = `
        fields id, name, aggregated_rating, platforms.name, screenshots.url, first_release_date, storyline, videos.video_id, cover.url, summary, genres.name, game_modes.name; 
        search "${searchQuery}"; 
        limit ${limit}; 
        offset ${offset};`;
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

      allGames.push(...games);

      if (games.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    // Sort fetched games by aggregated rating before processing them
    allGames.sort((a, b) => (b.aggregated_rating || 0) - (a.aggregated_rating || 0));

    const updatedGames = [];

    for (const game of allGames.slice(0, limit - existingGames.length)) {
      let existingGame = await Game.findOne({ gameId: game.id });
      let coverUrl = game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : await fetchGameCover(game.id, ACCESS_TOKEN);
    
      // Fetch YouTube video if no video is available from IGDB
      let videoUrl = '';
      if (game.videos && game.videos.length > 0) {
        videoUrl = `https://www.youtube.com/watch?v=${game.videos[0].video_id}`;
      } else {
        videoUrl = await fetchYouTubeVideo(game.name);
      }
    
      // Save new game to the database if it doesn't exist
      if (!existingGame) {
        existingGame = new Game({
          gameId: game.id,
          name: game.name,
          aggregatedRating: game.aggregated_rating,
          platforms: game.platforms ? game.platforms.map((platform) => platform.name) : [],
          screenshots: game.screenshots ? game.screenshots.map((screenshot) => screenshot.url) : [],
          firstReleaseDate: game.first_release_date,
          storyline: game.storyline,
          videos: [videoUrl],
          coverUrl: coverUrl,
          summary: game.summary,
          genres: game.genres ? game.genres.map((genre) => genre.name) : [],
          gameModes: game.game_modes ? game.game_modes.map((mode) => mode.name) : [],
        });
        await existingGame.save();
      }
    
      // Prepare the game data for the response
      // Prepare the game data for the response
const gameData = {
  id: game.id,
  name: game.name,
  aggregatedRating: game.aggregated_rating,
  platforms: game.platforms ? game.platforms.map((platform) => platform.name) : [],
  screenshots: game.screenshots ? game.screenshots.map((screenshot) => screenshot.url) : [],
  firstReleaseDate: game.first_release_date,
  storyline: game.storyline,
  videos: [videoUrl],
  coverUrl: coverUrl,
  summary: (() => {
    if (!game.summary) return '';
    const words = game.summary.split(' ');
    if (words.length <= 40) return game.summary;
    
    let summary = words.slice(0, 40).join(' ');
    const lastPeriodIndex = summary.lastIndexOf('.');
    return lastPeriodIndex !== -1 ? summary.slice(0, lastPeriodIndex + 1) : summary;
  })(),
  genres: game.genres ? game.genres.map((genre) => genre.name) : [],
  gameModes: game.game_modes ? game.game_modes.map((mode) => mode.name) : [],
};
    
      updatedGames.push(gameData);
    
      // Stop if we have reached the limit
      if (updatedGames.length + existingGames.length >= limit) break;
    }
    
    // Combine existing and newly fetched games
    const allResults = [...existingGames, ...updatedGames];
    
    console.log(`Total games found: ${allResults.length}`);
    res.json(allResults);
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