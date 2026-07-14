--!strict

local Types = require(script.Parent.Parent.Types)
type ExpeditionDefinition = Types.ExpeditionDefinition

local expeditions: { [string]: ExpeditionDefinition } = {
	WESTERN_COAST = {
		id = "WESTERN_COAST",
		displayName = "Западный берег",
		period = "793–866",
		origin = "SCANDINAVIA",
		destination = "BRITAIN",
		minimumCrew = 8,
		cost = { food = 24, timber = 8, cloth = 4, morale = 0, silver = 0 },
		durationSeconds = 240,
		encounterIds = { "NORTH_SEA_STORM", "FOREIGN_HARBOR", "MONASTERY_WARNING" },
		rewardFacts = { "LINDISFARNE_793", "YORK_866" },
	},
	EASTERN_RIVER = {
		id = "EASTERN_RIVER",
		displayName = "Речной путь",
		period = "860–907",
		origin = "SCANDINAVIA",
		destination = "BYZANTIUM",
		minimumCrew = 10,
		cost = { food = 34, timber = 12, cloth = 5, morale = 5, silver = 8 },
		durationSeconds = 360,
		encounterIds = { "PORTAGE", "RIVER_TRADE", "RAPIDS" },
		rewardFacts = { "EASTERN_TRADE", "CONSTANTINOPLE_907" },
	},
	NORTH_ATLANTIC = {
		id = "NORTH_ATLANTIC",
		displayName = "Северная Атлантика",
		period = "874–1021",
		origin = "SCANDINAVIA",
		destination = "VINLAND",
		minimumCrew = 12,
		cost = { food = 46, timber = 16, cloth = 9, morale = 10, silver = 4 },
		durationSeconds = 480,
		encounterIds = { "OPEN_OCEAN", "GREENLAND_ICE", "UNKNOWN_COAST" },
		rewardFacts = { "ICELAND_SETTLEMENT", "GREENLAND_SETTLEMENT", "L_ANSE_AUX_MEADOWS" },
	},
}

return table.freeze(expeditions)
