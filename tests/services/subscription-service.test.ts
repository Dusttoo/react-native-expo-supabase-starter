import { SubscriptionService } from '../../src/services/subscription-service'

// Mock react-native-purchases at the module level
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    getCustomerInfo: jest.fn(),
  },
  LOG_LEVEL: { ERROR: 'ERROR' },
}))

import Purchases from 'react-native-purchases'
const mockPurchases = Purchases as jest.Mocked<typeof Purchases>

function makeCustomerInfo(entitlements: string[]) {
  const active: Record<string, unknown> = {}
  entitlements.forEach((e) => (active[e] = { isActive: true }))
  return { entitlements: { active } } as any
}

function makeOffering(packages: { identifier: string }[]) {
  return {
    current: {
      identifier: 'default',
      serverDescription: 'Default offering',
      availablePackages: packages.map((pkg) => ({
        identifier: pkg.identifier,
        packageType: 'MONTHLY',
        product: {
          identifier: `product_${pkg.identifier}`,
          title: 'Pro Monthly',
          description: 'Pro plan',
          price: 9.99,
          priceString: '$9.99',
          currencyCode: 'USD',
        },
      })),
      monthly: null,
      annual: null,
      lifetime: null,
    },
  } as any
}

describe('SubscriptionService', () => {
  let service: SubscriptionService

  beforeEach(() => {
    service = new SubscriptionService()
    jest.clearAllMocks()
  })

  describe('identifyUser', () => {
    it('returns "premium" when premium entitlement is active', async () => {
      mockPurchases.logIn.mockResolvedValue({
        customerInfo: makeCustomerInfo(['premium']),
        created: false,
      } as any)

      const tier = await service.identifyUser('user-uuid-1')
      expect(tier).toBe('premium')
      expect(mockPurchases.logIn).toHaveBeenCalledWith('user-uuid-1')
    })

    it('returns "pro" when only pro entitlement is active', async () => {
      mockPurchases.logIn.mockResolvedValue({
        customerInfo: makeCustomerInfo(['pro']),
        created: false,
      } as any)

      const tier = await service.identifyUser('user-uuid-1')
      expect(tier).toBe('pro')
    })

    it('returns "free" when no entitlements are active', async () => {
      mockPurchases.logIn.mockResolvedValue({
        customerInfo: makeCustomerInfo([]),
        created: false,
      } as any)

      const tier = await service.identifyUser('user-uuid-1')
      expect(tier).toBe('free')
    })

    it('throws on RC error', async () => {
      mockPurchases.logIn.mockRejectedValue(new Error('Network error'))

      await expect(service.identifyUser('user-uuid-1')).rejects.toThrow('Network error')
    })
  })

  describe('getOfferings', () => {
    it('returns mapped offering when current offering exists', async () => {
      mockPurchases.getOfferings.mockResolvedValue(
        makeOffering([{ identifier: '$rc_monthly' }])
      )

      const result = await service.getOfferings()
      expect(result).not.toBeNull()
      expect(result!.identifier).toBe('default')
      expect(result!.availablePackages).toHaveLength(1)
      expect(result!.availablePackages[0].product.price).toBe(9.99)
    })

    it('returns null when no current offering', async () => {
      mockPurchases.getOfferings.mockResolvedValue({ current: null } as any)

      const result = await service.getOfferings()
      expect(result).toBeNull()
    })
  })

  describe('purchasePackage', () => {
    it('returns the tier from the resulting customer info', async () => {
      mockPurchases.getOfferings.mockResolvedValue(
        makeOffering([{ identifier: '$rc_monthly' }])
      )
      mockPurchases.purchasePackage.mockResolvedValue({
        customerInfo: makeCustomerInfo(['pro']),
      } as any)

      const tier = await service.purchasePackage('$rc_monthly')
      expect(tier).toBe('pro')
    })

    it('throws when the package identifier is not found', async () => {
      mockPurchases.getOfferings.mockResolvedValue(makeOffering([]))

      await expect(service.purchasePackage('$rc_monthly')).rejects.toThrow(
        'Package not found: $rc_monthly'
      )
    })
  })

  describe('restorePurchases', () => {
    it('returns the restored tier', async () => {
      mockPurchases.restorePurchases.mockResolvedValue(
        makeCustomerInfo(['premium'])
      )

      const tier = await service.restorePurchases()
      expect(tier).toBe('premium')
    })

    it('returns "free" when no purchases to restore', async () => {
      mockPurchases.restorePurchases.mockResolvedValue(makeCustomerInfo([]))

      const tier = await service.restorePurchases()
      expect(tier).toBe('free')
    })
  })

  describe('getCurrentTier', () => {
    it('returns current tier from customer info', async () => {
      mockPurchases.getCustomerInfo.mockResolvedValue(makeCustomerInfo(['pro']))

      const tier = await service.getCurrentTier()
      expect(tier).toBe('pro')
    })
  })
})
