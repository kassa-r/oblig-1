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
exports.CardGame = void 0;
const cards_1 = require("cards");
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const fs_2 = require("fs");
const util_2 = require("util");
const path_1 = __importDefault(require("path"));
const readFileAsync = util_1.default.promisify(fs_1.default.readFile);
const writeFileAsync = (0, util_2.promisify)(fs_2.writeFile);
function toSuit(value) {
    const suits = ["hearts", "clubs", "diamonds", "spades"];
    if (!suits.includes(value)) {
        throw new Error(`Invalid suit: ${value}`);
    }
    return value;
}
class CardGame {
    constructor() {
        this.deck = new cards_1.decks.StandardDeck({ jokers: 0 });
        this.deck.shuffleAll();
    }
    dealAndSaveCards() {
        return __awaiter(this, void 0, void 0, function* () {
            const numOfPlayers = 4;
            const cardsPerPlayer = 13;
            for (let i = 0; i < numOfPlayers; i++) {
                const hand = this.deck.draw(cardsPerPlayer).map((card) => ({
                    suit: card.suit.name,
                    rank: card.rank.abbrn,
                }));
                try {
                    yield writeFileAsync(`player_${i + 1}_hand.json`, // player_1_hand.json, player_2_hand.json, etc.
                    JSON.stringify(hand, null, 2), "utf8");
                    console.log(`Player ${i + 1}'s hand dealt and saved.`);
                }
                catch (error) {
                    console.error(`Failed to save Player ${i + 1}'s hand:`, error);
                }
            }
        });
    }
    calculatePointsForPlayer(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filePath = path_1.default.join(__dirname, "..", `player_${playerId}_hand.json`);
                const data = yield readFileAsync(filePath, "utf8");
                const hand = JSON.parse(data).map((card) => ({
                    suit: toSuit(card.suit),
                    rank: card.rank,
                }));
                return this.calculatePoints(hand);
            }
            catch (error) {
                console.error(`Failed to read or calculate points for player ${playerId}:`, error);
                throw error;
            }
        });
    }
    calculatePoints(hand) {
        let points = 0;
        const suitCounts = {
            hearts: 0,
            clubs: 0,
            diamonds: 0,
            spades: 0,
        };
        hand.forEach((card) => {
            switch (card.rank) {
                case "A":
                    points += 4;
                    break;
                case "K":
                    points += 3;
                    break;
                case "Q":
                    points += 2;
                    break;
                case "J":
                    points += 1;
                    break;
            }
            suitCounts[card.suit] += 1;
        });
        Object.values(suitCounts).forEach((count) => {
            if (count === 0)
                points += 3; // Tom for en farge
            else if (count === 1)
                points += 2; // Bare ett kort
            else if (count === 2)
                points += 1; // To kort
        });
        return points;
    }
}
exports.CardGame = CardGame;
//# sourceMappingURL=cards.js.map