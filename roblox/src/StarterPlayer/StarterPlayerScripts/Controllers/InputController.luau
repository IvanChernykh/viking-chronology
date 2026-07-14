--!strict

local ContextActionService = game:GetService("ContextActionService")
local UserInputService = game:GetService("UserInputService")

local InputController = {}
InputController.__index = InputController

function InputController.new()
	return setmetatable({ callbacks = {} :: { [string]: () -> () } }, InputController)
end

function InputController:on(action: string, callback: () -> ())
	self.callbacks[action] = callback
end

function InputController:_fire(action: string)
	local callback = self.callbacks[action]
	if callback then
		callback()
	end
end

function InputController:start()
	ContextActionService:BindAction("VikingInteract", function(_, state)
		if state == Enum.UserInputState.Begin then
			self:_fire("Interact")
		end
		return Enum.ContextActionResult.Sink
	end, true, Enum.KeyCode.E, Enum.KeyCode.ButtonX)
	ContextActionService:SetTitle("VikingInteract", "Говорить")
	ContextActionService:SetPosition("VikingInteract", UDim2.fromScale(0.84, 0.78))

	ContextActionService:BindAction("VikingJournal", function(_, state)
		if state == Enum.UserInputState.Begin then
			self:_fire("Journal")
		end
		return Enum.ContextActionResult.Sink
	end, true, Enum.KeyCode.J, Enum.KeyCode.ButtonY)
	ContextActionService:SetTitle("VikingJournal", "Хроника")
	ContextActionService:SetPosition("VikingJournal", UDim2.fromScale(0.72, 0.78))

	if not UserInputService.TouchEnabled then
		ContextActionService:SetTitle("VikingInteract", "E · Говорить")
	end
end

return InputController
