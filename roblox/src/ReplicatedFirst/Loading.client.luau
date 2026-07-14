--!strict

local Players = game:GetService("Players")
local ReplicatedFirst = game:GetService("ReplicatedFirst")
local TweenService = game:GetService("TweenService")

ReplicatedFirst:RemoveDefaultLoadingScreen()

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "VikingLoading"
gui.IgnoreGuiInset = true
gui.ResetOnSpawn = false
gui.DisplayOrder = 10000
gui.Parent = player:WaitForChild("PlayerGui")

local background = Instance.new("Frame")
background.Size = UDim2.fromScale(1, 1)
background.BackgroundColor3 = Color3.fromRGB(7, 12, 17)
background.Parent = gui

local title = Instance.new("TextLabel")
title.AnchorPoint = Vector2.new(0.5, 0.5)
title.Position = UDim2.fromScale(0.5, 0.47)
title.Size = UDim2.fromOffset(680, 80)
title.BackgroundTransparency = 1
title.Text = "VIKING CHRONOLOGY"
title.TextColor3 = Color3.fromRGB(222, 194, 132)
title.Font = Enum.Font.GothamBold
title.TextScaled = true
title.Parent = background

local status = Instance.new("TextLabel")
status.AnchorPoint = Vector2.new(0.5, 0)
status.Position = UDim2.fromScale(0.5, 0.55)
status.Size = UDim2.fromOffset(620, 42)
status.BackgroundTransparency = 1
status.Text = "Загружаем Скандинавию и ближайшие воды…"
status.TextColor3 = Color3.fromRGB(174, 188, 194)
status.Font = Enum.Font.Gotham
status.TextScaled = true
status.Parent = background

if not game:IsLoaded() then
	game.Loaded:Wait()
end
task.wait(0.35)
TweenService:Create(background, TweenInfo.new(0.55), { BackgroundTransparency = 1 }):Play()
TweenService:Create(title, TweenInfo.new(0.4), { TextTransparency = 1 }):Play()
TweenService:Create(status, TweenInfo.new(0.4), { TextTransparency = 1 }):Play()
task.wait(0.6)
gui:Destroy()
