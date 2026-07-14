--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Protocol = require(Shared.Net.Protocol)

local RemoteService = {}
RemoteService.__index = RemoteService

export type RemoteService = typeof(setmetatable({
	folder = nil :: Folder?,
	events = {} :: { [string]: RemoteEvent },
}, RemoteService))

function RemoteService.new(): RemoteService
	return setmetatable({ folder = nil, events = {} }, RemoteService)
end

function RemoteService:init()
	local existing = ReplicatedStorage:FindFirstChild(Protocol.FolderName)
	local folder = if existing and existing:IsA("Folder") then existing else Instance.new("Folder")
	folder.Name = Protocol.FolderName
	folder.Parent = ReplicatedStorage
	self.folder = folder

	for _, remoteName in Protocol.Events do
		local remote = folder:FindFirstChild(remoteName)
		if remote == nil or not remote:IsA("RemoteEvent") then
			if remote then
				remote:Destroy()
			end
			remote = Instance.new("RemoteEvent")
			remote.Name = remoteName
			remote.Parent = folder
		end
		self.events[remoteName] = remote :: RemoteEvent
	end
end

function RemoteService:getEvent(name: string): RemoteEvent
	local remote = self.events[name]
	assert(remote ~= nil, `Remote {name} is not registered`)
	return remote
end

function RemoteService:fireClient(player: Player, name: string, payload: any)
	self:getEvent(name):FireClient(player, payload)
end

function RemoteService:broadcast(name: string, payload: any)
	self:getEvent(name):FireAllClients(payload)
end

return RemoteService
