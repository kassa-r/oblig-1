interface Player {
  id: string;
  name: string;
}

let players: Player[] = [
  { id: "east", name: "Alice" },
  { id: "west", name: "Bob" },
];

const usedIds = new Set();

export const getAllPlayers = (): Player[] => {
  return players;
};

export const getPlayerById = (id: string): Player | undefined => {
  return players.find((player) => player.id === id);
};

export const addPlayer = (name: string, id: string): Player | null => {
  const validIds = ["north", "east", "south", "west"];
  if (!validIds.includes(id) || players.some((player) => player.id === id)) {
    console.error(`Invalid or already used ID: ${id}`);
    return null;
  }

  const newPlayer: Player = { id, name };
  players.push(newPlayer);
  return newPlayer;
};

export const deletePlayer = (id: string): void => {
  players = players.filter((player) => player.id !== id);
};
