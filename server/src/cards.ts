import { decks } from "cards";
import fs from "fs";
import util from "util";
import { writeFile } from "fs";
import { promisify } from "util";
import path from "path";

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = promisify(writeFile);

type Suit = "hearts" | "clubs" | "diamonds" | "spades";

function toSuit(value: string): Suit {
  const suits: Suit[] = ["hearts", "clubs", "diamonds", "spades"];
  if (!suits.includes(value as Suit)) {
    throw new Error(`Invalid suit: ${value}`);
  }
  return value as Suit;
}

export class CardGame {
  private deck: decks.StandardDeck;

  constructor() {
    this.deck = new decks.StandardDeck({ jokers: 0 });
    this.deck.shuffleAll();
  }

  async dealAndSaveCards(): Promise<void> {
    const numOfPlayers = 4;
    const cardsPerPlayer = 13;

    for (let i = 0; i < numOfPlayers; i++) {
      const hand = this.deck.draw(cardsPerPlayer).map((card) => ({
        suit: card.suit.name,
        rank: card.rank.abbrn,
      }));

      try {
        await writeFileAsync(
          `player_${i + 1}_hand.json`, // player_1_hand.json, player_2_hand.json, etc.
          JSON.stringify(hand, null, 2),
          "utf8"
        );
        console.log(`Player ${i + 1}'s hand dealt and saved.`);
      } catch (error) {
        console.error(`Failed to save Player ${i + 1}'s hand:`, error);
      }
    }
  }

  async calculatePointsForPlayer(playerId: number): Promise<number> {
    try {
      const filePath = path.join(
        __dirname,
        "..",
        `player_${playerId}_hand.json`
      );
      const data = await readFileAsync(filePath, "utf8");
      const hand = JSON.parse(data).map(
        (card: { suit: string; rank: string }) => ({
          suit: toSuit(card.suit),
          rank: card.rank,
        })
      );

      return this.calculatePoints(hand);
    } catch (error) {
      console.error(
        `Failed to read or calculate points for player ${playerId}:`,
        error
      );
      throw error;
    }
  }

  calculatePoints(hand: Array<{ suit: Suit; rank: string }>): number {
    let points = 0;
    const suitCounts: Record<Suit, number> = {
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
      if (count === 0) points += 3; // Tom for en farge
      else if (count === 1) points += 2; // Bare ett kort
      else if (count === 2) points += 1; // To kort
    });

    return points;
  }
}
