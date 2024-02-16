"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.addPlayer = exports.getPlayerById = exports.getAllPlayers = void 0;
let players = [
    { id: "east", name: "Alice" },
    { id: "west", name: "Bob" },
];
const usedIds = new Set();
const getAllPlayers = () => {
    return players;
};
exports.getAllPlayers = getAllPlayers;
const getPlayerById = (id) => {
    return players.find((player) => player.id === id);
};
exports.getPlayerById = getPlayerById;
const addPlayer = (name, id) => {
    const validIds = ["north", "east", "south", "west"];
    if (!validIds.includes(id) || players.some((player) => player.id === id)) {
        console.error(`Invalid or already used ID: ${id}`);
        return null;
    }
    const newPlayer = { id, name };
    players.push(newPlayer);
    return newPlayer;
};
exports.addPlayer = addPlayer;
const deletePlayer = (id) => {
    players = players.filter((player) => player.id !== id);
};
exports.deletePlayer = deletePlayer;
//# sourceMappingURL=player.js.map