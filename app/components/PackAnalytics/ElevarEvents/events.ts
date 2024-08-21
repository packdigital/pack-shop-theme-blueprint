import {PackEventName} from '../constants';

import {
  generateUserProperties,
  mapCartLine,
  mapProductItemVariant,
  mapProductPageVariant,
} from './utils';

export const ANALYTICS_NAME = 'ElevarEvents';

const PAGE_TYPES: Record<string, string> = {
  '/': 'home',
  '/account': 'customersAccount',
  '/account/activate': 'customersActivateAccount',
  '/account/addresses': 'customersAddresses',
  '/account/login': 'customersLogin',
  '/account/orders/': 'customersOrders',
  '/account/register': 'customersRegister',
  '/account/reset': 'customersResetPassword',
  '/articles': 'article',
  '/blogs': 'blog',
  '/cart': 'cart',
  '/collections': 'collection',
  '/not-found': 'notFound',
  '/pages': 'page',
  '/404': 'notFound',
  '/pages/privacy-policy': 'policy',
  '/pages/search': 'search',
  '/products': 'product',
  '/search': 'search',
};

const logSubscription = ({
  data,
  packEventName,
}: {
  data: Record<string, any>;
  packEventName: string;
}) => {
  console.log(
    `${ANALYTICS_NAME}: 📥 subscribed to analytics for \`${packEventName}\`:`,
    data,
  );
};

const logError = ({
  packEventName,
  message = 'Unknown error',
}: {
  packEventName: string;
  message?: string | unknown;
}) => {
  console.error(
    `${ANALYTICS_NAME}: ❌ error from \`${packEventName}\`: ${message}`,
  );
};

const emitEvent = ({
  event,
  debug,
  onEmit,
}: {
  event: Record<string, any>;
  debug?: boolean;
  onEmit?: (event: Record<string, any>) => void;
}) => {
  try {
    if (event.event === 'dl_route_update') {
      if (!window.ElevarInvalidateContext) return;
      window.ElevarInvalidateContext();
      if (typeof onEmit === 'function') onEmit(event);
      if (debug) console.log('ElevarEvents: ⏩ pushed context');
      return;
    }
    window.ElevarDataLayer = window.ElevarDataLayer ?? [];
    window.ElevarDataLayer.push(event);
    if (debug)
      console.log(
        `${ANALYTICS_NAME}: 🚀 event emitted for \`${event.event}\`:`,
        event,
      );
    if (typeof onEmit === 'function') onEmit(event);
  } catch (error) {
    logError({
      packEventName: 'emitEvent',
      message: error instanceof Error ? error.message : error,
    });
  }
};

const customerEvent = ({
  onEmit,
  debug,
  ...data
}: Record<string, any> & {
  onEmit?: (event: Record<string, any>) => void;
  debug?: boolean;
}) => {
  const packEventName = PackEventName.CUSTOMER;
  try {
    if (debug) logSubscription({data, packEventName});

    const {cart, customer, shop} = data;
    if (typeof customer === 'undefined')
      throw new Error('`customer` parameter is missing.');

    const previousPath = sessionStorage.getItem('PREVIOUS_PATH');
    const list =
      (window.location.pathname.startsWith('/collections') &&
        window.location.pathname) ||
      (previousPath?.startsWith('/collections') && previousPath) ||
      '';
    const event = {
      event: 'dl_user_data',
      user_properties: generateUserProperties({customer}),
      cart_total: cart?.cost?.totalAmount?.amount || '0.0',
      ecommerce: {
        currencyCode: cart?.cost?.totalAmount?.currencyCode || shop?.currency,
        cart_contents: {
          products: cart?.lines?.nodes?.map(mapCartLine(list)) || [],
        },
      },
    };
    emitEvent({event, onEmit, debug});
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

const viewPageEvent = ({
  debug,
  ...data
}: Record<string, any> & {debug?: boolean}) => {
  const packEventName = PackEventName.PAGE_VIEWED;
  try {
    if (debug) logSubscription({data, packEventName});

    const {url, customer} = data;
    if (!url) throw new Error('`url` parameter is missing.');

    const newUrl = new URL(url);
    const {pathname, search} = newUrl;
    const pageType = pathname.startsWith('/account/orders/')
      ? PAGE_TYPES['/account/orders/']
      : PAGE_TYPES[pathname] ||
        PAGE_TYPES[pathname.split('/').slice(0, -1).join('/')] ||
        '';
    const event = {
      event: 'dl_route_update',
      user_properties: generateUserProperties({customer}),
      page: {
        path: pathname,
        title: document.title,
        type: pageType,
        search,
      },
    };
    emitEvent({event, debug});
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

const viewProductQuickShopEvent = ({
  debug,
  ...data
}: Record<string, any> & {debug?: boolean}) => {
  const packEventName = PackEventName.PRODUCT_QUICK_SHOP_VIEWED;
  try {
    if (debug) logSubscription({data, packEventName});

    const {customer, shop} = data;
    const {product, selectedVariant} = data.customData;
    if (!product)
      throw new Error('`product` parameter is missing in `customData`.');

    let variant = selectedVariant;
    if (!variant) variant = product.variants?.nodes?.[0];
    if (!variant) return;
    variant = {
      ...variant,
      image: variant.image || product.featuredImage,
      product: {
        ...variant.product,
        vendor: product.vendor,
        collections: product.collections,
      },
    };
    const previousPath = sessionStorage.getItem('PREVIOUS_PATH');
    const list = previousPath?.startsWith('/collections') ? previousPath : '';
    const event = {
      event: 'dl_view_item',
      user_properties: generateUserProperties({customer}),
      ecommerce: {
        currencyCode: variant.price?.currencyCode || shop?.currency,
        detail: {
          actionField: {list, action: 'detail'},
          products: [variant].map(mapProductPageVariant(list)),
        },
      },
    };
    emitEvent({event, debug});
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

const viewCartEvent = ({
  debug,
  ...data
}: Record<string, any> & {debug?: boolean}) => {
  const packEventName = PackEventName.CART_VIEWED;
  try {
    if (debug) logSubscription({data, packEventName});

    const {cart, customer, shop} = data;

    const previousPath = sessionStorage.getItem('PREVIOUS_PATH');
    const list =
      (window.location.pathname.startsWith('/collections') &&
        window.location.pathname) ||
      (previousPath?.startsWith('/collections') && previousPath) ||
      '';
    const event = {
      event: 'dl_view_cart',
      user_properties: generateUserProperties({customer}),
      cart_total: cart?.cost?.totalAmount?.amount || '0.0',
      ecommerce: {
        currencyCode: cart?.cost?.totalAmount?.currencyCode || shop?.currency,
        actionField: {list: 'Shopping Cart'},
        impressions:
          cart?.lines?.nodes?.slice(0, 7).map(mapCartLine(list)) || [],
      },
    };
    // Elevar requires a `dl_user_data` event before `dl_view_cart`
    customerEvent({
      ...data,
      customer: customer || null,
      onEmit: () => emitEvent({event, debug}),
      debug,
    });
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

const addToCartEvent = ({
  debug,
  ...data
}: Record<string, any> & {debug?: boolean}) => {
  const packEventName = PackEventName.PRODUCT_ADD_TO_CART;
  try {
    if (debug) logSubscription({data, packEventName});

    const {cart, currentLine, customer, shop} = data;
    if (!cart || !currentLine)
      throw new Error('`cart` and/or `currentLine` parameters are missing.');

    const previousPath = sessionStorage.getItem('PREVIOUS_PATH');
    const list =
      (window.location.pathname.startsWith('/collections') &&
        window.location.pathname) ||
      (previousPath?.startsWith('/collections') && previousPath) ||
      '';
    const event = {
      event: 'dl_add_to_cart',
      user_properties: generateUserProperties({customer}),
      cart_total: cart.cost?.totalAmount?.amount || '0.0',
      ecommerce: {
        currencyCode: cart.cost?.totalAmount?.currencyCode || shop?.currency,
        add: {
          actionField: {list},
          products: [currentLine].map(mapCartLine(list)),
        },
      },
    };
    emitEvent({event, debug});
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

const removeFromCartEvent = ({
  debug,
  ...data
}: Record<string, any> & {debug?: boolean}) => {
  const packEventName = PackEventName.PRODUCT_REMOVED_FROM_CART;
  try {
    if (debug) logSubscription({data, packEventName});

    const {cart, prevLine, customer, shop} = data;
    if (!cart || !prevLine)
      throw new Error('`cart` and/or `prevLine` parameters are missing.');

    const previousPath = sessionStorage.getItem('PREVIOUS_PATH');
    const list =
      (window.location.pathname.startsWith('/collections') &&
        window.location.pathname) ||
      (previousPath?.startsWith('/collections') && previousPath) ||
      '';
    const event = {
      event: 'dl_remove_from_cart',
      user_properties: generateUserProperties({customer}),
      cart_total: cart.cost?.totalAmount?.amount || '0.0',
      ecommerce: {
        currencyCode: cart.cost?.totalAmount?.currencyCode || shop?.currency,
        remove: {
          actionField: {list},
          products: [prevLine].map(mapCartLine(list)),
        },
      },
    };
    emitEvent({event, debug});
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

const clickProductItemEvent = ({
  debug,
  ...data
}: Record<string, any> & {debug?: boolean}) => {
  const packEventName = PackEventName.PRODUCT_ITEM_CLICKED;
  try {
    if (debug) logSubscription({data, packEventName});

    const {product, listIndex, searchTerm, customer, shop} = data;
    let {selectedVariant} = data;
    if (!selectedVariant) selectedVariant = product?.variants?.nodes?.[0];
    if (!selectedVariant)
      throw new Error('`selectedVariant` parameter is missing.');

    const list = window.location.pathname.startsWith('/collections')
      ? window.location.pathname
      : '';

    const variant = {
      ...selectedVariant,
      image: selectedVariant.image || product?.featuredImage || '',
      index: listIndex,
      product: {
        ...selectedVariant.product,
        vendor: product?.vendor,
        collections: product?.collections,
      },
      list,
    };

    const event = {
      event: 'dl_select_item',
      user_properties: generateUserProperties({customer}),
      ecommerce: {
        currencyCode: variant.price?.currencyCode || shop?.currency,
        click: {
          actionField: {
            list: searchTerm ? 'search results' : list,
            action: 'click',
            ...(!!searchTerm && {search_term: searchTerm}),
          },
          products: [variant].map(mapProductItemVariant(list)),
        },
      },
    };
    emitEvent({event, debug});
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

export {
  addToCartEvent,
  clickProductItemEvent,
  customerEvent,
  emitEvent,
  removeFromCartEvent,
  viewCartEvent,
  viewPageEvent,
  viewProductQuickShopEvent,
};
