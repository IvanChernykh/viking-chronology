--!strict

local GameConfig = {
	DataStoreName = "VikingChronology_Profile_v1",
	ProfileVersion = 1,
	AutosaveSeconds = 60,
	ShutdownSaveBudgetSeconds = 25,
	RemoteRateWindowSeconds = 10,
	RemoteRateMaxRequests = 35,
	InteractionDistance = 22,
	NPCSimulationRadius = 180,
	NPCSleepRadius = 260,
	ShipServerTick = 1 / 20,
	MaxShipSpeed = 54,
	StreamingProbeDistance = 900,
	WorldYearMin = 750,
	WorldYearMax = 1021,
	DefaultLocale = "ru-ru",
	DefaultResources = {
		food = 80,
		timber = 55,
		cloth = 35,
		morale = 70,
		silver = 25,
	},
	Quality = {
		High = { vegetationDensity = 1.0, npcDistance = 220, shadowQuality = 3, waterDetail = 3 },
		Balanced = { vegetationDensity = 0.68, npcDistance = 170, shadowQuality = 2, waterDetail = 2 },
		Battery = { vegetationDensity = 0.35, npcDistance = 110, shadowQuality = 0, waterDetail = 1 },
	},
}

return table.freeze(GameConfig)
