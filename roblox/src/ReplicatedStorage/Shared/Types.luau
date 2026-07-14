--!strict

export type RegionId =
	"SCANDINAVIA"
	| "NORTH_SEA"
	| "BRITAIN"
	| "FRANKIA"
	| "BALTIC"
	| "EASTERN_RIVERS"
	| "BYZANTIUM"
	| "ICELAND"
	| "GREENLAND"
	| "VINLAND"

export type ExpeditionState = "Planning" | "Provisioning" | "Embarked" | "Encounter" | "Completed" | "Failed"

export type Resources = {
	food: number,
	timber: number,
	cloth: number,
	morale: number,
	silver: number,
}

export type PlayerProfile = {
	version: number,
	createdAt: number,
	updatedAt: number,
	resources: Resources,
	unlockedRegions: { [RegionId]: boolean },
	completedExpeditions: { [string]: boolean },
	knownFacts: { [string]: boolean },
	settings: {
		locale: string,
		quality: "Auto" | "High" | "Balanced" | "Battery",
		subtitles: boolean,
	},
}

export type RegionDefinition = {
	id: RegionId,
	displayName: string,
	center: Vector3,
	radius: number,
	unlockYear: number,
	parent: RegionId?,
	placeId: number?,
	streamingPriority: number,
}

export type ExpeditionDefinition = {
	id: string,
	displayName: string,
	period: string,
	origin: RegionId,
	destination: RegionId,
	minimumCrew: number,
	cost: Resources,
	durationSeconds: number,
	encounterIds: { string },
	rewardFacts: { string },
}

export type ExpeditionRuntime = {
	id: string,
	state: ExpeditionState,
	progress: number,
	startedAt: number?,
	resolvedEncounters: { [string]: boolean },
	resources: Resources,
	nextEncounterIndex: number,
	activeEncounterId: string?,
}

return nil
