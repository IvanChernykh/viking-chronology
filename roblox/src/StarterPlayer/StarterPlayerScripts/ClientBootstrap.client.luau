--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Controllers = script.Parent:WaitForChild("Controllers")
local Protocol = require(ReplicatedStorage:WaitForChild("Shared").Net.Protocol)

local CameraController = require(Controllers.CameraController)
local StreamingController = require(Controllers.StreamingController)
local InputController = require(Controllers.InputController)
local UIController = require(Controllers.UIController)
local AudioController = require(Controllers.AudioController)
local InteractionController = require(Controllers.InteractionController)
local ExpeditionController = require(Controllers.ExpeditionController)

local remotes = ReplicatedStorage:WaitForChild(Protocol.FolderName) :: Folder
local camera = CameraController.new()
local streaming = StreamingController.new()
local input = InputController.new()
local ui = UIController.new()
local audio = AudioController.new()
local interactions = InteractionController.new(remotes)
local expeditions = ExpeditionController.new(remotes, ui, camera, audio)

ui:start()
audio:start()
streaming:start()
camera:start()
interactions:start()
expeditions:start()
input:on("Interact", function()
	interactions:interact()
end)
input:on("Journal", function()
	ui:notify("Хроника будет открыта поверх мира")
end)
input:start()

local ready = remotes:FindFirstChild(Protocol.Events.ClientReady)
if ready and ready:IsA("RemoteEvent") then
	ready:FireServer({ version = "0.1.0-foundation" })
end
