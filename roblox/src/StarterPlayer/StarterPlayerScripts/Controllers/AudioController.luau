--!strict

local SoundService = game:GetService("SoundService")
local TweenService = game:GetService("TweenService")

local AudioController = {}
AudioController.__index = AudioController

function AudioController.new()
	return setmetatable({ groups = {} :: { [string]: SoundGroup }, layers = {} :: { [string]: Sound } }, AudioController)
end

function AudioController:_group(name: string, volume: number): SoundGroup
	local group = Instance.new("SoundGroup")
	group.Name = name
	group.Volume = volume
	group.Parent = SoundService
	self.groups[name] = group
	return group
end

function AudioController:_layer(name: string, soundId: string, group: SoundGroup, volume: number)
	local sound = Instance.new("Sound")
	sound.Name = name
	sound.SoundId = soundId
	sound.SoundGroup = group
	sound.Looped = true
	sound.Volume = volume
	sound.Parent = SoundService
	self.layers[name] = sound
	if soundId ~= "" then
		sound:Play()
	end
end

function AudioController:start()
	local ambience = self:_group("Ambience", 0.8)
	local music = self:_group("Music", 0.65)
	local dialogue = self:_group("Dialogue", 1.0)
	self:_layer("Wind", "", ambience, 0.35)
	self:_layer("Sea", "", ambience, 0.5)
	self:_layer("Score", "", music, 0.3)
	dialogue.Volume = 1
end

function AudioController:setVoyage(active: boolean)
	local sea = self.layers.Sea
	local score = self.layers.Score
	if sea then
		TweenService:Create(sea, TweenInfo.new(1.5), { Volume = if active then 0.75 else 0.3 }):Play()
	end
	if score then
		TweenService:Create(score, TweenInfo.new(2), { Volume = if active then 0.48 else 0.2 }):Play()
	end
end

return AudioController
