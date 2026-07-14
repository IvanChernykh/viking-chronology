--!strict

local Protocol = {
	FolderName = "VikingNetwork",
	Events = {
		RequestInteraction = "RequestInteraction",
		RequestExpedition = "RequestExpedition",
		ResolveEncounter = "ResolveEncounter",
		ClientReady = "ClientReady",
		StateChanged = "StateChanged",
		Notification = "Notification",
		Telemetry = "Telemetry",
	},
}

function Protocol.isFiniteNumber(value: any): boolean
	return typeof(value) == "number" and value == value and math.abs(value) < math.huge
end

function Protocol.isShortString(value: any, maxLength: number): boolean
	return typeof(value) == "string" and #value > 0 and #value <= maxLength
end

function Protocol.validateInteraction(payload: any): boolean
	return typeof(payload) == "table"
		and Protocol.isShortString(payload.targetId, 64)
		and Protocol.isFiniteNumber(payload.clientTime)
end

function Protocol.validateExpedition(payload: any): boolean
	return typeof(payload) == "table" and Protocol.isShortString(payload.expeditionId, 64)
end

function Protocol.validateEncounter(payload: any): boolean
	return typeof(payload) == "table"
		and Protocol.isShortString(payload.encounterId, 64)
		and Protocol.isShortString(payload.choiceId, 64)
end

return table.freeze(Protocol)
