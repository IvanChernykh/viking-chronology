--!strict

local Services = script.Parent:WaitForChild("Services")

local RemoteService = require(Services.RemoteService)
local PlayerDataService = require(Services.PlayerDataService)
local WorldService = require(Services.WorldService)
local ExpeditionService = require(Services.ExpeditionService)
local InteractionService = require(Services.InteractionService)
local NPCService = require(Services.NPCService)
local TelemetryService = require(Services.TelemetryService)

local remotes = RemoteService.new()
remotes:init()

local playerData = PlayerDataService.new()
local world = WorldService.new(playerData)
local telemetry = TelemetryService.new()
local expeditions = ExpeditionService.new(playerData, world, remotes)
local interactions = InteractionService.new(remotes, playerData)
local npcs = NPCService.new()

world:init()
playerData:start()
world:start()
expeditions:start()
interactions:start()
npcs:start()

telemetry:event(nil, "server_boot", { version = "0.1.0-foundation" })
print("[VikingChronology] Roblox production foundation started")
