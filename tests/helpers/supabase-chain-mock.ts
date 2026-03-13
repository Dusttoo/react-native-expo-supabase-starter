export function createSupabaseChainMock(resolvedValue: unknown, error?: unknown) {
  const chain: Record<string, jest.Mock> = {}

  const terminal = error
    ? jest.fn().mockRejectedValue(error)
    : jest.fn().mockResolvedValue({ data: resolvedValue, error: null })

  const returnChain = jest.fn().mockReturnValue(chain)

  // Filter/builder methods: all return the chain for continued chaining
  chain.select = returnChain
  chain.insert = returnChain
  chain.update = returnChain
  chain.delete = returnChain
  chain.upsert = returnChain
  chain.eq = returnChain
  chain.neq = returnChain
  chain.gt = returnChain
  chain.gte = returnChain
  chain.lt = returnChain
  chain.lte = returnChain
  chain.like = returnChain
  chain.ilike = returnChain
  chain.in = returnChain
  chain.is = returnChain
  chain.order = returnChain
  chain.limit = returnChain
  chain.range = returnChain
  chain.filter = returnChain
  chain.match = returnChain
  chain.not = returnChain
  chain.or = returnChain
  chain.contains = returnChain
  chain.containedBy = returnChain
  chain.overlaps = returnChain

  // Terminal calls: resolve the chain
  chain.single = terminal
  chain.maybeSingle = terminal
  chain.then = jest.fn((resolve: (val: unknown) => void) =>
    Promise.resolve({ data: resolvedValue, error: null }).then(resolve)
  )

  return {
    from: jest.fn().mockReturnValue(chain),
    chain,
  }
}
