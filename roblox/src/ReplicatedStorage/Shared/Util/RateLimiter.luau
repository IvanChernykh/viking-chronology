--!strict

local RateLimiter = {}
RateLimiter.__index = RateLimiter

export type RateLimiter = typeof(setmetatable({} :: {
	windowSeconds: number,
	maxRequests: number,
	buckets: { [number]: { startedAt: number, count: number } },
}, RateLimiter))

function RateLimiter.new(windowSeconds: number, maxRequests: number): RateLimiter
	return setmetatable({ windowSeconds = windowSeconds, maxRequests = maxRequests, buckets = {} }, RateLimiter)
end

function RateLimiter:allow(userId: number): boolean
	local now = os.clock()
	local bucket = self.buckets[userId]
	if bucket == nil or now - bucket.startedAt >= self.windowSeconds then
		self.buckets[userId] = { startedAt = now, count = 1 }
		return true
	end
	if bucket.count >= self.maxRequests then
		return false
	end
	bucket.count += 1
	return true
end

function RateLimiter:remove(userId: number)
	self.buckets[userId] = nil
end

return RateLimiter
