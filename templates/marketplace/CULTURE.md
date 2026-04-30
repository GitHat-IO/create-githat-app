# Marketplace template — culture notes

This template ships with Latin American framing by default: bilingual
microcopy (Spanish primary, English gloss), a category seed list
suited to a Caribbean *colmado*, warm-amber + produce-green palette.
That's because the first real consumer is **Colmado**, a Dominican-
flavored bodega marketplace. Anglo developers will get bilingual
copy out of the box — most US neighborhoods that *need* a
marketplace template are multilingual anyway.

If you're targeting a different region, change these in order:

1. `src/lib/categories.ts` — category seed data
2. `app/page.tsx` — hero strings
3. `src/components/AuthChoice.tsx` — checkout copy
4. `app/globals.css` — `--brand-primary` / `--brand-secondary`

Everything else is region-agnostic.

## What "colmado" means

A *colmado* in Latin America (Caribbean especially — Dominican
Republic, Puerto Rico) is a corner store, but more than a corner
store: it's the social anchor of a city block. Music plays. Domino
tables out front. The shopkeeper (*colmadero*) knows your kids by
name and gives you *fiao* — store credit on a handshake — when
you're between paychecks. Recargas (phone top-ups) are universal.
Single eggs, single cigarettes, loose rice by the pound — sold by
the *menudeo*, not in pre-packed quantities.

Cuban *bodegas* and Mexican *misceláneas* / *tienditas* fill the
same social slot but with different vocab and different drink
brands.

## Microcopy that matters

These strings are baked into the template. Don't translate them
literally if you reskin — find local equivalents.

| Spanish | English gloss | Where it appears |
|---|---|---|
| **Pídelo y te lo llevamos** | Order it, we'll bring it to you | Cart CTA |
| **Tu colmadero** | Your shopkeeper (NOT "vendor") | Vendor profile label |
| **Tu funda** | Your bag (Dominican; replaces "Cart") | Top nav cart icon label |
| **Recargas** | Phone top-ups (universally understood, keep Spanish) | Category tile |
| **Cerquita de ti** | Right near you (warmer than "near you") | Homepage hero |
| **Lo de siempre** | The usual (for re-order) | Saved-cart shortcut |
| **Está fresquecito** | Nice and fresh (for produce) | Freshness tag |
| **Abierto ahorita** | Open right now (colloquial) | Open/closed badge |
| **Un momentico…** | One moment… | Loading state |
| **Llegó tu pedido, ¡buen provecho!** | Your order is here, enjoy! | Delivery confirmation |

## Patterns to avoid (Latin American context)

- "Carrito de compras" — too Anglo-translated. Use **"Tu funda."**
- "Vendedor" — clinical. Use **"Tu colmadero"** or **"Doña/Don [Nombre]."**
- *Usted* everywhere — formal, distancing. Use *tú* unless the audience is older.
- Cartoon sombreros / maracas / "spicy" tropes — condescending.
- Demanding a credit card up front — kills the *fiao* spirit. Cash
  on delivery and tab-based payment must be first-class options.
- Sterile English category names like "Beverages." Use **"Bebidas /
  Cervezas frías"** with the freshness signal preserved.
- Treating *menudeo* (single egg, single cigarette) as broken data.
  These are real SKUs.

## Why the bilingual default helps US adoption too

The template's first audience is Latin American, but the second is
the **US Latino diaspora and the Anglo neighborhoods buying from
local bodegas**. NYC bodegas, Texas tienditas, halal corner stores
in every borough — same DNA, same UX needs. Shipping bilingual by
default means the diaspora developer doesn't fight the template,
and Anglo developers building locally get an honest representation
of who their users are.
