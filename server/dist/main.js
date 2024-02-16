"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Node imports.
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
// Library imports.
const express_1 = __importDefault(require("express"));
const player_1 = require("./player");
const cards_1 = require("./cards");
const contract_1 = require("./contract");
// Express app.
const app = (0, express_1.default)();
// Handle JSON in request bodies.
app.use(express_1.default.json());
// Serve the client.
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../client/dist")));
const readFileAsync = util_1.default.promisify(fs_1.default.readFile);
// Enable CORS so that we can call the API even from anywhere.
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});
/*
// REST //
som håndterer pekere for spillere, kortstokk og meldesystem
*/
//////////////////// SPILLERE //////////////////
app.get("/players", (req, res) => {
    const players = (0, player_1.getAllPlayers)();
    res.json(players);
});
app.get("/players/:id", (req, res) => {
    const { id } = req.params;
    const player = (0, player_1.getPlayerById)(id);
    if (player) {
        res.json(player);
    }
    else {
        res.status(404).send("Player not found");
    }
});
app.post("/players", (req, res) => {
    const { name, id } = req.body;
    const newPlayer = (0, player_1.addPlayer)(name, id);
    if (newPlayer) {
        res.status(201).json(newPlayer);
    }
    else {
        res.status(400).send("Invalid or already used ID");
    }
});
app.delete("/players/:id", (req, res) => {
    const { id } = req.params;
    (0, player_1.deletePlayer)(id);
    res.status(204).send();
});
/////////////////// KORTHÅNDTERING ////////////////
const cardGame = new cards_1.CardGame();
// Dele ut hele kortstokken på 52 kort, til 4 spillere, 13 stk hver
app.get("/deal", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cardGame.dealAndSaveCards();
        res.send("Cards dealt and saved to individual player files.");
    }
    catch (error) {
        console.error("Error dealing cards:", error);
        res.status(500).send("Failed to deal cards");
    }
}));
app.get("/players/:id/hand", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const filePath = path_1.default.join(__dirname, "..", `player_${id}_hand.json`);
    try {
        const data = yield readFileAsync(filePath, "utf8");
        const hand = JSON.parse(data);
        res.json(hand);
    }
    catch (error) {
        console.error(`Error reading hand for player ${id}:`, error);
        if (error.code === "ENOENT") {
            res.status(404).send(`Hand for player ${id} not found.`);
        }
        else {
            res.status(500).send(`Failed to fetch hand for player ${id}`);
        }
    }
}));
// Velge et og et kort fra enkelt spillers hånd
app.get("/players/:id/hand/:cardIndex", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, cardIndex } = req.params;
    const filePath = `player_${id}_hand.json`;
    try {
        const data = yield readFileAsync(filePath, { encoding: "utf8" });
        const hand = JSON.parse(data);
        const index = parseInt(cardIndex, 10) - 1;
        if (isNaN(index) || index < 0 || index >= hand.length) {
            return res.status(404).send("Card not found.");
        }
        const card = hand[index];
        res.json(card);
    }
    catch (error) {
        console.error("Error fetching card:", error);
        res.status(500).send("Failed to fetch card.");
    }
}));
// Beregne poeng etter HP og antall kort i hver sort
app.get("/players/:id/points", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const playerId = parseInt(id, 10);
        if (isNaN(playerId)) {
            return res.status(400).send("Invalid player ID");
        }
        const points = yield cardGame.calculatePointsForPlayer(playerId);
        res.json({ playerId, points });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while calculating points");
    }
}));
/////////// MELDESYSTEM ////////////
app.get("/players/:id/bid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const playerId = parseInt(id, 10);
        if (isNaN(playerId)) {
            return res.status(400).send("Invalid player ID");
        }
        const points = yield cardGame.calculatePointsForPlayer(playerId);
        const bid = contract_1.BridgeContract.determineOpeningBid(points);
        res.json({ playerId, bid });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while determining the bid");
    }
}));
// Start app listening.
app.listen(80, () => {
    console.log("Bridge server open for requests");
});
//# sourceMappingURL=main.js.map