import {
  isRouteErrorResponse,
  Outlet,
  useMatches,
  useRouteError,
} from '@remix-run/react';
import type {ShouldRevalidateFunction} from '@remix-run/react';
import {defer} from '@shopify/remix-oxygen';
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaArgs,
} from '@shopify/remix-oxygen';
import {
  getSeoMeta,
  getShopAnalytics,
  ShopifySalesChannel,
} from '@shopify/hydrogen';

import {ApplicationError, Document, NotFound, ServerError} from '~/components';
import {getEnvs, getShop, getSiteSettings, setPackCookie} from '~/lib/utils';
import {PRODUCT_QUERY} from '~/data/queries';
import {registerSections} from '~/sections';
import {registerStorefrontSettings} from '~/settings';
import {seoPayload} from '~/lib/seo.server';
import styles from '~/styles/app.css';
import {useLocale} from '~/hooks';

registerSections();
registerStorefrontSettings();

// This is important to avoid re-fetching root queries on sub-navigations
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  defaultShouldRevalidate,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }
  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }
  return defaultShouldRevalidate;
};

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
    },
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
    },
  ];
};

export async function loader({context, request}: LoaderFunctionArgs) {
  const {pack, storefront, env} = context;
  const isPreviewModeEnabled = pack.isPreviewModeEnabled();

  const searchParams = new URL(request.url).searchParams;
  const productHandle = String(searchParams.get('product') || '');

  const shop = await getShop(context);
  const siteSettings = await getSiteSettings(context);

  let product;
  let selectedVariant;
  if (productHandle) {
    const [handle, options] = productHandle.split('?');
    const variantParams = new URLSearchParams(options);
    const selectedOptions: Record<string, any>[] = [];
    variantParams.forEach((value, name) => {
      selectedOptions.push({name, value});
    });
    const {product: queriedProduct} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      cache: storefront.CacheShort(),
    });
    product = queriedProduct;
    selectedVariant = product?.selectedVariant ?? product?.variants?.nodes[0];
  }

  const newHeaders = new Headers();
  const {headers: headersWithPackCookie} = await setPackCookie({
    headers: newHeaders,
    request,
  });
  const headers = headersWithPackCookie;

  const analytics = {
    shopifySalesChannel: ShopifySalesChannel.hydrogen,
    shopId: shop.id,
  };
  const seo = seoPayload.root({
    shop,
    siteSettings,
    url: request.url,
  });
  const consent = {
    checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
    storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
  };
  const shopAnalytics = getShopAnalytics({
    storefront,
    publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
  });
  const ENV = await getEnvs({context, request});
  const SITE_TITLE = siteSettings?.data?.siteSettings?.seo?.title || shop.name;

  return defer(
    {
      analytics,
      consent,
      customizerMeta: pack.preview?.session.get('customizerMeta'),
      ENV: {...ENV, SITE_TITLE} as Record<string, string>,
      isPreviewModeEnabled,
      product,
      selectedVariant,
      seo,
      shop: shopAnalytics,
      siteSettings,
      siteTitle: SITE_TITLE,
      url: request.url,
    },
    {headers},
  );
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function App() {
  const {language} = useLocale();
  return (
    <html lang={language}>
      <Document>
        <Outlet />
      </Document>
    </html>
  );
}

export function ErrorBoundary() {
  const {language} = useLocale();
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);
  const [root] = useMatches();

  if (!root?.data) return <ServerError error={routeError} />;

  const title = isRouteError ? 'Not Found' : 'Application Error';

  return (
    <html lang={language}>
      <Document title={title}>
        {isRouteError ? <NotFound /> : <ApplicationError error={routeError} />}
      </Document>
    </html>
  );
}
