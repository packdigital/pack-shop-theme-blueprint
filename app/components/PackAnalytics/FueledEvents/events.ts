import {v4 as uuidv4} from 'uuid';

import {PackEventName} from '../constants';

import {
  generateUserProperties,
  mapCartLine,
  mapProductItemVariant,
  mapProductPageVariant,
} from './utils';

export const ANALYTICS_NAME = 'FueledEvents';

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

const dispatchEvent = ({
  event,
  debug,
  onDispatch,
}: {
  event: Record<string, any>;
  debug?: boolean;
  onDispatch?: (event: Record<string, any>) => void;
}) => {
  try {
    const dispatchedEvent = {
      ...event,
      event_id: uuidv4(),
      event_time: new Date().toISOString(),
    } as Record<string, any>;
    window.dispatchEvent(
      new CustomEvent(dispatchedEvent.event, {
        detail: dispatchedEvent,
      }),
    );
    if (debug)
      console.log(
        `${ANALYTICS_NAME}: 🚀 dispatched event listener for \`${dispatchedEvent.event}\`:`,
        dispatchedEvent,
      );
    if (typeof onDispatch === 'function') onDispatch(dispatchedEvent);
  } catch (error) {
    logError({
      packEventName: 'dispatchEvent',
      message: error instanceof Error ? error.message : error,
    });
  }
};

const customerEvent = ({
  onDispatch,
  debug,
  ...data
}: Record<string, any> & {
  onDispatch?: (event: Record<string, any>) => void;
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
      ecommerce: {
        currency_code: cart?.cost?.totalAmount?.currencyCode || shop?.currency,
        cart_contents: {
          products: cart?.lines?.nodes?.map(mapCartLine(list)) || [],
        },
        cart_total: cart?.cost?.totalAmount?.amount || '0.0',
      },
    };
    dispatchEvent({event, onDispatch, debug});
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
    dispatchEvent({event, debug});
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
        currency_code: variant.price?.currencyCode || shop?.currency,
        detail: {
          actionField: {list, action: 'detail'},
          products: [variant].map(mapProductPageVariant(list)),
        },
      },
    };
    dispatchEvent({event, debug});
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
      ecommerce: {
        currency_code: cart?.cost?.totalAmount?.currencyCode || shop?.currency,
        actionField: {list: 'Shopping Cart'},
        products: cart?.lines?.nodes?.slice(0, 12).map(mapCartLine(list)) || [],
        cart_id: cart?.id?.split('/').pop() || 'uninitialized',
        cart_total: cart?.cost?.totalAmount?.amount || '0.0',
        cart_count: cart?.totalQuantity || 0,
      },
    };
    dispatchEvent({event, debug});
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
      ecommerce: {
        currency_code: cart.cost?.totalAmount?.currencyCode || shop?.currency,
        add: {
          actionField: {list},
          products: [currentLine].map(mapCartLine(list)),
        },
        cart_id: cart.id?.split('/').pop(),
        cart_total: cart.cost?.totalAmount?.amount || '0.0',
        cart_count: cart.totalQuantity,
      },
    };
    dispatchEvent({event, debug});
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
      ecommerce: {
        currency_code: cart.cost?.totalAmount?.currencyCode || shop?.currency,
        remove: {
          actionField: {list},
          products: [prevLine].map(mapCartLine(list)),
        },
        cart_id: cart.id?.split('/').pop(),
        cart_total: cart.cost?.totalAmount?.amount || '0.0',
        cart_count: cart.totalQuantity,
      },
    };
    dispatchEvent({event, debug});
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
        currency_code: variant.price?.currencyCode || shop?.currency,
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
    dispatchEvent({event, debug});
  } catch (error) {
    logError({
      packEventName,
      message: error instanceof Error ? error.message : error,
    });
  }
};

const clickProductVariantEvent = ({
  debug,
  ...data
}: Record<string, any> & {debug?: boolean}) => {
  const packEventName = PackEventName.PRODUCT_VARIANT_SELECTED;
  try {
    if (debug) logSubscription({data, packEventName});

    const {
      selectedVariant,
      optionName,
      optionValue,
      fromProductHandle,
      fromGrouping,
      customer,
      shop,
    } = data;
    if (!selectedVariant)
      throw new Error('`selectedVariant` parameter is missing.');

    const list = window.location.pathname.startsWith('/collections')
      ? window.location.pathname
      : '';

    const variant = {
      ...selectedVariant,
      image: selectedVariant.image || '',
      list,
    };

    const event = {
      event: 'dl_select_item_variant',
      user_properties: generateUserProperties({customer}),
      ecommerce: {
        currency_code: variant.price?.currencyCode || shop?.currency,
        click: {
          actionField: {list, action: 'click'},
          products: [variant].map(mapProductItemVariant(list)),
          optionName,
          optionValue: optionValue?.name,
          fromProductHandle,
          fromGrouping: fromGrouping || false,
        },
      },
    };
    dispatchEvent({event, debug});
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
  clickProductVariantEvent,
  customerEvent,
  dispatchEvent,
  removeFromCartEvent,
  viewCartEvent,
  viewPageEvent,
  viewProductQuickShopEvent,
};
