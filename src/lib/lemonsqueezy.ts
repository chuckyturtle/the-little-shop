export const SHOP_PRICE_USD = 5

export async function createCheckout(params: {
  shopId: string
  shopName: string
  userId: string
  successUrl: string
  cancelUrl: string
}): Promise<string> {
  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: { shopId: params.shopId, userId: params.userId },
          },
          product_options: {
            name: `Publicar tienda: ${params.shopName}`,
            description: "Pago único para publicar tu tienda en The Little Shop",
            redirect_url: params.successUrl,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: process.env.LEMONSQUEEZY_VARIANT_ID },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Lemon Squeezy error: ${err}`)
  }

  const data = await res.json()
  return data.data.attributes.url as string
}
