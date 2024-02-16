// Node imports.
import path from "path";
import fs from "fs";
import util from "util";

// Library imports.
import express, { Express, NextFunction, Request, Response } from "express";
import {
  getAllPlayers,
  getPlayerById,
  addPlayer,
  deletePlayer,
} from "./player";

import { CardGame } from "./cards";
import { BridgeContract } from "./contract";

// Express app.
const app: Express = express();

// Handle JSON in request bodies.
app.use(express.json());

// Serve the client.
app.use("/", express.static(path.join(__dirname, "../../client/dist")));

const readFileAsync = util.promisify(fs.readFile);

// Enable CORS so that we can call the API even from anywhere.
app.use(function (
  inRequest: Request,
  inResponse: Response,
  inNext: NextFunction
) {
  inResponse.header("Access-Control-Allow-Origin", "*");
  inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  inResponse.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  inNext();
});

/*
// REST //
som håndterer pekere for spillere, kortstokk og meldesystem
*/

//////////////////// SPILLERE //////////////////
app.get("/players", (req: Request, res: Response) => {
  const players = getAllPlayers();
  res.json(players);
});

app.get("/players/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const player = getPlayerById(id);
  if (player) {
    res.json(player);
  } else {
    res.status(404).send("Player not found");
  }
});

app.post("/players", (req, res) => {
  const { name, id } = req.body;
  const newPlayer = addPlayer(name, id);
  if (newPlayer) {
    res.status(201).json(newPlayer);
  } else {
    res.status(400).send("Invalid or already used ID");
  }
});

app.delete("/players/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  deletePlayer(id);
  res.status(204).send();
});

/////////////////// KORTHÅNDTERING ////////////////
const cardGame = new CardGame();

// Dele ut hele kortstokken på 52 kort, til 4 spillere, 13 stk hver
app.get("/deal", async (req, res) => {
  try {
    await cardGame.dealAndSaveCards();
    res.send("Cards dealt and saved to individual player files.");
  } catch (error) {
    console.error("Error dealing cards:", error);
    res.status(500).send("Failed to deal cards");
  }
});

app.get("/players/:id/hand", async (req, res) => {
  const { id } = req.params;
  const filePath = path.join(__dirname, "..", `player_${id}_hand.json`);

  try {
    const data = await readFileAsync(filePath, "utf8");
    const hand = JSON.parse(data);
    res.json(hand);
  } catch (error) {
    console.error(`Error reading hand for player ${id}:`, error);
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      res.status(404).send(`Hand for player ${id} not found.`);
    } else {
      res.status(500).send(`Failed to fetch hand for player ${id}`);
    }
  }
});

// Velge et og et kort fra enkelt spillers hånd
app.get("/players/:id/hand/:cardIndex", async (req, res) => {
  const { id, cardIndex } = req.params;
  const filePath = `player_${id}_hand.json`;

  try {
    const data = await readFileAsync(filePath, { encoding: "utf8" });
    const hand = JSON.parse(data);

    const index = parseInt(cardIndex, 10) - 1;
    if (isNaN(index) || index < 0 || index >= hand.length) {
      return res.status(404).send("Card not found.");
    }

    const card = hand[index];
    res.json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).send("Failed to fetch card.");
  }
});

// Beregne poeng etter HP og antall kort i hver sort
app.get("/players/:id/points", async (req, res) => {
  const { id } = req.params;

  try {
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return res.status(400).send("Invalid player ID");
    }

    const points = await cardGame.calculatePointsForPlayer(playerId);
    res.json({ playerId, points });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while calculating points");
  }
});

/////////// MELDESYSTEM ////////////
app.get("/players/:id/bid", async (req, res) => {
  const { id } = req.params;

  try {
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return res.status(400).send("Invalid player ID");
    }

    const points = await cardGame.calculatePointsForPlayer(playerId);
    const bid = BridgeContract.determineOpeningBid(points);

    res.json({ playerId, bid });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while determining the bid");
  }
});

// Start app listening.
app.listen(80, () => {
  console.log("Bridge server open for requests");
});
