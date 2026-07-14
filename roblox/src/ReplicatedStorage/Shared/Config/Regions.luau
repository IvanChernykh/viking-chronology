--!strict

local Types = require(script.Parent.Parent.Types)
type RegionDefinition = Types.RegionDefinition

local regions: { [Types.RegionId]: RegionDefinition } = {
	SCANDINAVIA = { id = "SCANDINAVIA", displayName = "Скандинавия", center = Vector3.new(0, 0, 0), radius = 1800, unlockYear = 750, parent = nil, streamingPriority = 100 },
	NORTH_SEA = { id = "NORTH_SEA", displayName = "Северное море", center = Vector3.new(-2500, 0, -400), radius = 2200, unlockYear = 780, parent = "SCANDINAVIA", streamingPriority = 90 },
	BRITAIN = { id = "BRITAIN", displayName = "Британские острова", center = Vector3.new(-4700, 0, -700), radius = 1900, unlockYear = 793, parent = "NORTH_SEA", streamingPriority = 80 },
	FRANKIA = { id = "FRANKIA", displayName = "Франкское побережье", center = Vector3.new(-4000, 0, 1800), radius = 2100, unlockYear = 820, parent = "NORTH_SEA", streamingPriority = 72 },
	BALTIC = { id = "BALTIC", displayName = "Балтика", center = Vector3.new(2300, 0, 400), radius = 2200, unlockYear = 800, parent = "SCANDINAVIA", streamingPriority = 78 },
	EASTERN_RIVERS = { id = "EASTERN_RIVERS", displayName = "Восточные речные пути", center = Vector3.new(5600, 0, 2400), radius = 3200, unlockYear = 860, parent = "BALTIC", streamingPriority = 62 },
	BYZANTIUM = { id = "BYZANTIUM", displayName = "Византия", center = Vector3.new(6800, 0, 6300), radius = 1800, unlockYear = 907, parent = "EASTERN_RIVERS", streamingPriority = 50 },
	ICELAND = { id = "ICELAND", displayName = "Исландия", center = Vector3.new(-7600, 0, -2100), radius = 1900, unlockYear = 874, parent = "NORTH_SEA", streamingPriority = 60 },
	GREENLAND = { id = "GREENLAND", displayName = "Гренландия", center = Vector3.new(-11000, 0, -3200), radius = 2400, unlockYear = 985, parent = "ICELAND", streamingPriority = 45 },
	VINLAND = { id = "VINLAND", displayName = "Западный горизонт", center = Vector3.new(-14500, 0, -2800), radius = 2200, unlockYear = 1000, parent = "GREENLAND", streamingPriority = 35 },
}

return table.freeze(regions)
