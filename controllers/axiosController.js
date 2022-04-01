const axios = require('axios').default
const [
  helpers
] = [
  require('../utils/helpers')
]

const headers =
{
  headers: {
    'Authorization': 'Bearer ' + process.env.JWT,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

const getAnimeList = async (query) => {
  try {
    const response = await axios.get('https://api.aniapi.com/v1/anime' + (query ? query : ''), headers)
    return response
  } catch (error) {
    console.log(error)
  }
}

const getAnime = async (id) => {
  try {
    const response = await axios.get(`https://api.aniapi.com/v1/anime/${id}`, headers)
    return response
  } catch (error) {
    console.log(error)
  }
}

// the api uses a default value for it's scrapper, and this default source/language may not have the info we want, so we try until
// find one that has, if not, return an empty response data. ID 11 is default for one piece :)
const getAnimeEpisodes = async (param, update = false) => {
  try {
    let response;
    let bestResponse;
    let locales = await axios.get('https://api.aniapi.com/v1/resources/1.0/1', headers)
    locales = await locales.data.data.localizations

    if (update) {
      update = param
      bestResponse = await axios.get('https://api.aniapi.com/v1/episode?anime_id=' + update.id + '&locale=' + update.locale + '&is_dub=' + false + '&page=' + update.page, headers)
    } else {
      for (let i = 0; i < locales.length; i++) {
        // TODO language selection
        response = await axios.get('https://api.aniapi.com/v1/episode?anime_id=' + param + '&locale=' + locales[i].i18n + '&is_dub=' + false, headers)

        if ((await response.data.data.count > bestResponse?.data.data.count) || (await response.data.data.count && !bestResponse?.data))
          bestResponse = response
      }
    }

    if (bestResponse)
      return bestResponse
    return null

  } catch (error) {
    console.log(error)
  }
}

// statuses of an anime:
const FINISHED = 0
const RELEASING = 1
const NOT_YET_RELEASED = 2
const CANCELLED = 3

// since we are only using AniAPI on this project, to get airing today animes we need to get all anime being RELEASED in the current year and season, and then display only
// those that the start_date week day matches the current week day (from 0 to 6)
// now, because the api doesn't send us this information, this is very heavy and demanding for both parties 
const getAiringToday = async () => {
  try {
    const todaysDate = new Date()
    const CURRENT_YEAR = todaysDate.getFullYear()
    const DAY_OF_YEAR = Math.floor((todaysDate - new Date(todaysDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    const DAYS_EACH_SEASON = 91
    const customReq = { query: { status: RELEASING, year: CURRENT_YEAR, season: Math.floor(DAY_OF_YEAR / DAYS_EACH_SEASON), nsfw: false } }

    let airingToday = await getAnimeList(helpers.getQueryURL(customReq))

    airingToday.data.data.documents = await airingToday.data.data.documents.filter(anime => new Date(anime.start_date).getDay() === todaysDate.getDay())
    airingToday.data.message = `This is a normal query handled by the server to appear like a custom 'airing today' query, originally it had ${airingToday.data.data.count} results, but now it has only ${airingToday.data.data.documents.length}`
    airingToday.data.data.count = await airingToday.data.data.documents.length

    return airingToday
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getAnime,
  getAnimeList,
  getAnimeEpisodes,
  getAiringToday
}