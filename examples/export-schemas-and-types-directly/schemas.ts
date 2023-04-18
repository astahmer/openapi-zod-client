import { z } from "zod";

export const IssuersEnum = z.enum([
    "AMERICAN_EXPRESS",
    "BANK_OF_AMERICA",
    "BARCLAYS",
    "BREX",
    "CHASE",
    "CAPITAL_ONE",
    "CITI",
    "FIRST",
    "FNBO",
    "PENFED",
    "PNC",
    "SYNCHRONY",
    "US_BANK",
    "WELLS_FARGO",
]);
export type IssuersEnum = z.infer<typeof IssuersEnum>;
export const NetworksEnum = z.enum(["VISA", "MASTERCARD", "AMERICAN_EXPRESS", "DISCOVER"]);
export type NetworksEnum = z.infer<typeof NetworksEnum>;
export const CurrenciesEnum = z.enum([
    "BEST_WESTERN",
    "HILTON",
    "HYATT",
    "IHG",
    "MARRIOTT",
    "RADISSON",
    "WYNDHAM",
    "CHOICE",
    "AEROPLAN",
    "ALASKA",
    "AMERICAN",
    "ANA",
    "AVIANCA",
    "AVIOS",
    "CATHAY_PACIFIC",
    "DELTA",
    "EMIRATES",
    "FRONTIER",
    "FLYING_BLUE",
    "HAWAIIAN",
    "JETBLUE",
    "KOREAN",
    "LATAM",
    "LUFTHANSA",
    "SOUTHWEST",
    "SPIRIT",
    "UNITED",
    "VIRGIN",
    "AMERICAN_EXPRESS",
    "BANK_OF_AMERICA",
    "BARCLAYS",
    "BILT",
    "BREX",
    "CHASE",
    "CITI",
    "CAPITAL_ONE",
    "DISCOVER",
    "US_BANK",
    "WELLS_FARGO",
    "CARNIVAL",
    "AMTRAK",
    "PENFED",
    "USD",
]);
export type CurrenciesEnum = z.infer<typeof CurrenciesEnum>;
export const Credit = z.object({
    description: z.string().min(1),
    value: z.number(),
    weight: z.number().gte(0).lte(1),
    currency: CurrenciesEnum.optional(),
});
export type Credit = z.infer<typeof Credit>;
export const OfferAmount = z.object({ amount: z.number(), currency: CurrenciesEnum.optional() });
export type OfferAmount = z.infer<typeof OfferAmount>;
export const Offer = z.object({
    spend: z.number().gte(0),
    amount: z.array(OfferAmount),
    days: z.number().gte(30),
    expiration: z.string().optional(),
    isPublic: z.boolean().optional(),
    credits: z.array(Credit),
    details: z.string().optional(),
    url: z.string().optional(),
    referralUrl: z.string().optional(),
});
export type Offer = z.infer<typeof Offer>;
export const CreditCard = z.object({
    name: z.string().min(1),
    issuer: IssuersEnum,
    network: NetworksEnum,
    currency: CurrenciesEnum,
    countsTowards524: z.boolean().optional(),
    details: z.string().optional(),
    isBusiness: z.boolean(),
    annualFee: z.number(),
    isAnnualFeeWaived: z.boolean(),
    universalCashbackPercent: z.number().gte(1).lte(100),
    url: z.string(),
    imageUrl: z.string(),
    credits: z.array(Credit),
    offers: z.array(Offer),
    historicalOffers: z.array(Offer),
});
export type CreditCard = z.infer<typeof CreditCard>;

export const schemas = {
    IssuersEnum,
    NetworksEnum,
    CurrenciesEnum,
    Credit,
    OfferAmount,
    Offer,
    CreditCard,
};
