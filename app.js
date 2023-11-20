const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
let db
let dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('****SERVER RUNNING****')
    })
  } catch (error) {
    console.log(`DB Error:${error.message}`)
    process.exit(1)
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQue = `SELECT player_id as playerId, player_name as playerName FROM player_details;`
  const playersArray = await db.all(getPlayersQue)
  response.send(playersArray)
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const getPlayerQuery = `SELECT player_id as playerId, player_name as playerName 
  FROM player_details
  Where player_id = ${playerId};`
  const playersArray = await db.get(getPlayerQuery)
  response.send(playersArray)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body

  const updatePlayerQuery = `UPDATE player_details
  SET player_name='${playerName}'
  WHERE player_id =${playerId}`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params

  const getMatchQuery = `SELECT match_id as matchId, match, year 
  FROM match_details
  Where match_id = ${matchId};`
  const matchArray = await db.get(getMatchQuery)
  response.send(matchArray)
})

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params

  const mathcDetsQuery = `SELECT match_id as matchId, match, year 
  FROM match_details JOIN player_match_score
  ON match_details.match_id = player_match_score.match_id
  JOIN player_details
  ON player_details.player_id = player_match_score.player_id
  WHERE player_id= ${playerId}`
  const matchDetsArray = await db.get(mathcDetsQuery)
  response.send(matchDetsArray)
})

app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params

  const playerDetsQuery = `SELECT player_id as playerId, player_name as playerName 
  FROM player_match_score JOIN player_details
  ON player_match_score.player_id = player_match_score.player_id
  JOIN match_details
  ON match_details.match_id = player_match_score.match_id
  WHERE match_id= ${matchId}`
  const playersDetsArray = await db.get(playerDetsQuery)
  response.send(playersDetsArray)
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params

  const scoresQuery = `SELECT player_id as playerId, plsyer_name as playerName,
  score as totalScore, fours as totalFours, sixes as totalSixes
  FROM player_match_score JOIN player_details
  ON player_match_score.player_id = player_details.player_id
  WHERE player_id = ${playerId};
  `
  const score = await db.get(scoresQuery)
  response.send(score)
})
initializeDbServer()
