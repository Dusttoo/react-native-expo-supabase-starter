import { Platform } from 'react-native'
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
  CustomerInfo,
} from 'react-native-purchases'
import { SubscriptionTier, SubscriptionOffering } from '../types'

// Entitlement identifiers — must match what you configure in the RevenueCat dashboard
const ENTITLEMENTS = {
  pro: 'pro',
  premium: 'premium',
} as const

function mapOffering(offering: PurchasesOffering): SubscriptionOffering {
  return {
    identifier: offering.identifier,
    serverDescription: offering.serverDescription,
    availablePackages: offering.availablePackages.map((pkg) => ({
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      product: {
        identifier: pkg.product.identifier,
        title: pkg.product.title,
        description: pkg.product.description,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
        currencyCode: pkg.product.currencyCode,
      },
    })),
    monthly: offering.monthly
      ? {
          identifier: offering.monthly.identifier,
          packageType: offering.monthly.packageType,
          product: {
            identifier: offering.monthly.product.identifier,
            title: offering.monthly.product.title,
            description: offering.monthly.product.description,
            price: offering.monthly.product.price,
            priceString: offering.monthly.product.priceString,
            currencyCode: offering.monthly.product.currencyCode,
          },
        }
      : null,
    annual: offering.annual
      ? {
          identifier: offering.annual.identifier,
          packageType: offering.annual.packageType,
          product: {
            identifier: offering.annual.product.identifier,
            title: offering.annual.product.title,
            description: offering.annual.product.description,
            price: offering.annual.product.price,
            priceString: offering.annual.product.priceString,
            currencyCode: offering.annual.product.currencyCode,
          },
        }
      : null,
    lifetime: offering.lifetime
      ? {
          identifier: offering.lifetime.identifier,
          packageType: offering.lifetime.packageType,
          product: {
            identifier: offering.lifetime.product.identifier,
            title: offering.lifetime.product.title,
            description: offering.lifetime.product.description,
            price: offering.lifetime.product.price,
            priceString: offering.lifetime.product.priceString,
            currencyCode: offering.lifetime.product.currencyCode,
          },
        }
      : null,
  }
}

function tierFromCustomerInfo(customerInfo: CustomerInfo): SubscriptionTier {
  if (customerInfo.entitlements.active[ENTITLEMENTS.premium]) return 'premium'
  if (customerInfo.entitlements.active[ENTITLEMENTS.pro]) return 'pro'
  return 'free'
}

export class SubscriptionService {
  configure() {
    const apiKey =
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY

    if (!apiKey) {
      throw new Error(
        `RevenueCat API key is missing. ` +
        `Set EXPO_PUBLIC_REVENUECAT_API_KEY_IOS (iOS) or ` +
        `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY (Android) in your .env file.`
      )
    }

    Purchases.setLogLevel(LOG_LEVEL.ERROR)
    Purchases.configure({ apiKey })
  }

  async identifyUser(userId: string): Promise<SubscriptionTier> {
    const { customerInfo } = await Purchases.logIn(userId)
    return tierFromCustomerInfo(customerInfo)
  }

  async getOfferings(): Promise<SubscriptionOffering | null> {
    const offerings = await Purchases.getOfferings()
    if (!offerings.current) return null
    return mapOffering(offerings.current)
  }

  async purchasePackage(packageIdentifier: string): Promise<SubscriptionTier> {
    const offerings = await Purchases.getOfferings()
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.identifier === packageIdentifier
    )
    if (!pkg) throw new Error(`Package not found: ${packageIdentifier}`)

    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return tierFromCustomerInfo(customerInfo)
  }

  async restorePurchases(): Promise<SubscriptionTier> {
    const customerInfo = await Purchases.restorePurchases()
    return tierFromCustomerInfo(customerInfo)
  }

  async getCurrentTier(): Promise<SubscriptionTier> {
    const customerInfo = await Purchases.getCustomerInfo()
    return tierFromCustomerInfo(customerInfo)
  }

  async logOut(): Promise<void> {
    await Purchases.logOut()
  }
}
