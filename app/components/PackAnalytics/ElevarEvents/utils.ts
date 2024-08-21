import {ANALYTICS_NAME} from './events';

const STOREFRONT_NAME =
  (typeof document !== 'undefined' && window.ENV?.SITE_TITLE) || 'Storefront';

export const returnKeyValueIfNotUndefined = (key: string, value?: any) => {
  return value ? {[key]: value} : {};
};

let userPropertiesCache = null as Record<string, any> | null;

export const generateUserProperties = ({
  customer,
}: {
  customer: Record<string, any> | null;
}) => {
  let userProperties: Record<string, any> | null = null;
  if (customer) {
    if (userPropertiesCache?.customer_id === customer.id?.split('/').pop()) {
      return userPropertiesCache;
    }
    userProperties = {
      visitor_type: 'logged_in',
      user_consent: '',
      ...returnKeyValueIfNotUndefined(
        'customer_address_1',
        customer.defaultAddress?.address1,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_address_2',
        customer.defaultAddress?.address2,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_city',
        customer.defaultAddress?.city,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_country',
        customer.defaultAddress?.country,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_country_code',
        customer.defaultAddress?.countryCodeV2,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_phone',
        customer.defaultAddress?.phone,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_province_code',
        customer.defaultAddress?.provinceCode,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_province',
        customer.defaultAddress?.province,
      ),
      ...returnKeyValueIfNotUndefined(
        'customer_zip',
        customer.defaultAddress?.zip,
      ),
      customer_id: customer.id?.split('/').pop() || '',
      customer_email: customer.email || '',
      customer_first_name: customer.firstName || '',
      customer_last_name: customer.lastName || '',
      customer_tags: customer.tags?.join(', ') || '',
      customer_order_count: `${customer?.numberOfOrders || 0}`,
      customer_total_spent: customer.orders?.edges
        ?.reduce((acc: number, {node}: {node: any}) => {
          return acc + Number(node.totalPrice?.amount || '0');
        }, 0)
        .toFixed(2),
    };
  } else {
    userProperties = {
      visitor_type: 'guest',
      user_consent: '',
    };
  }
  userPropertiesCache = userProperties;
  return userProperties;
};

export const mapProductItemVariant =
  (list = '') =>
  (variant: Record<string, any> & {index: number}, index = 0) => {
    try {
      if (!variant) return null;

      return {
        id: variant.sku || '',
        name: variant.product?.title || '',
        brand: variant.product?.vendor || STOREFRONT_NAME,
        category: variant.product?.productType || 'Uncategorized',
        variant: variant.title || '',
        price: `${variant.price?.amount || ''}`,
        list,
        product_id: variant.product?.id?.split('/').pop() || '',
        variant_id: variant.id?.split('/').pop() || '',
        compare_at_price: `${variant.compareAtPrice?.amount || 'undefined'}`,
        image: variant.image?.url || '',
        position: (variant.index ?? index) + 1,
        url: `/products/${variant.product?.handle}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : error;
      console.error(
        `${ANALYTICS_NAME}: ❌ mapProductItemVariant error:`,
        message,
      );
      console.error(
        `${ANALYTICS_NAME}: ❌ mapProductItemVariant variant:`,
        variant,
      );
      return null;
    }
  };

export const mapProductPageVariant =
  (list = '') =>
  (variant: Record<string, any>) => {
    try {
      if (!variant) return null;

      const params = new URLSearchParams('');
      variant.selectedOptions?.forEach(({name, value}) => {
        params.set(name, value);
      });

      return {
        id: variant.sku || '',
        name: variant.product?.title || '',
        brand: variant.product?.vendor || STOREFRONT_NAME,
        category: variant.product?.productType || 'Uncategorized',
        variant: variant.title || '',
        price: `${variant.price?.amount || ''}`,
        list,
        product_id: variant.product?.id?.split('/').pop() || '',
        variant_id: variant.id?.split('/').pop() || '',
        compare_at_price: `${variant.compareAtPrice?.amount || 'undefined'}`,
        image: variant.image?.url || '',
        url: `/products/${variant.product?.handle}?${params}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : error;
      console.error(
        `${ANALYTICS_NAME}: ❌ mapProductPageVariant error:`,
        message,
      );
      console.error(
        `${ANALYTICS_NAME}: ❌ mapProductPageVariant variant:`,
        variant,
      );
      return null;
    }
  };

export const mapCartLine =
  (list = '') =>
  (line: Record<string, any> & {index?: number}, index = 0) => {
    try {
      const {quantity, merchandise} = {...line};
      if (!merchandise) return null;

      return {
        id: merchandise.sku || '',
        name: merchandise.product?.title || '',
        brand: merchandise.product?.vendor || STOREFRONT_NAME,
        category: merchandise.product?.productType || 'Uncategorized',
        variant: merchandise.title || '',
        price: merchandise.price?.amount || '',
        quantity: `${quantity || ''}`,
        list,
        product_id: merchandise.product?.id?.split('/').pop() || '',
        variant_id: merchandise.id?.split('/').pop() || '',
        compare_at_price: merchandise.compareAtPrice?.amount || 'undefined',
        image: merchandise.image?.url || '',
        position: (line.index || index) + 1,
        url: `/products/${merchandise.product?.handle}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : error;
      console.error(`${ANALYTICS_NAME}: ❌ mapCartLine error:`, message);
      console.error(`${ANALYTICS_NAME}: ❌ mapCartLine line:`, line);
      return null;
    }
  };
