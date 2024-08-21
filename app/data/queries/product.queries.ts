import {SECTION_FRAGMENT} from './pack.queries';
import {
  SELLING_PLAN_ALLOCATION_FRAGMENT,
  SELLING_PLAN_GROUP_FRAGMENT,
} from './sellingPlans.queries';

/*
 * STOREFRONT API QUERIES -----------------------------------------------------
 */

// Docs: https://shopify.dev/docs/api/storefront/latest/queries/product

export const OPTION_FRAGMENT = `#graphql
  fragment option on ProductOption {
    id
    name
    optionValues {
      id
      name
      swatch {
        color
        image {
          mediaContentType
          previewImage {
            height
            id
            url
            width
            altText
          }
          id
          alt
        }
      }
    }
  }
`;

export const METAFIELD_FRAGMENT = `#graphql
fragment metafield on Metafield {
    createdAt
    description
    id
    key
    namespace
    type
    updatedAt
    value
  }
`;

export const VARIANT_FRAGMENT = `#graphql
  fragment variantFragment on ProductVariant {
    id
    title
    availableForSale
    sku
    weight
    weightUnit
    image {
      altText
      height
      id
      url
      width
    }
    price {
      currencyCode
      amount
    }
    sellingPlanAllocations(first: 10) {
      edges {
        node {
          ... on SellingPlanAllocation {
            ...sellingPlanAllocation
          }
        }
      }
    }
    compareAtPrice {
      currencyCode
      amount
    }
    selectedOptions {
      name
      value
    }
    product {
      handle
      id
      productType
      title
      tags
    }
  }
  ${SELLING_PLAN_ALLOCATION_FRAGMENT}
` as const;

export const PRODUCT_FRAGMENT = `#graphql
  fragment productFragment on Product {
    id
    title
    handle
    vendor
    descriptionHtml
    productType
    publishedAt
    tags
    collections(first: 250) {
      nodes {
        handle
      }
    }
    featuredImage {
      altText
      height
      id
      url
      width
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    media(first: 250) {
      nodes {
        alt
        id
        mediaContentType
        previewImage {
          altText
          height
          id
          url
          width
        }
        ... on Video {
          sources {
            height
            url
            width
            mimeType
          }
        }
        ... on ExternalVideo {
          originUrl
          alt
          embedUrl
          host
          id
          mediaContentType
          previewImage {
            altText
            height
            id
            url
            width
          }
        }
        ... on Model3d {
          id
          alt
          mediaContentType
          sources {
            filesize
            format
            mimeType
            url
          }
          previewImage {
            altText
            height
            id
            url
            width
          }
        }
      }
    }
    options {
      ...option
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ... on ProductVariant {
          ...variantFragment
        }
    }
    sellingPlanGroups(first: 10) {
      edges {
        node {
          ... on SellingPlanGroup {
            ...sellingPlanGroup
          }
        }
      }
    }
    variants(first: 250) {
      nodes {
        ... on ProductVariant {
          ...variantFragment
        }
      }
    }
    seo {
      description
      title
    }
  }
  ${VARIANT_FRAGMENT}
  ${SELLING_PLAN_GROUP_FRAGMENT}
  ${OPTION_FRAGMENT}
` as const;

export const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment productItemFragment on Product {
    id
    title
    handle
    vendor
    productType
    createdAt
    publishedAt
    tags
    collections(first: 10) {
      nodes {
        handle
      }
    }
    featuredImage {
      altText
      height
      id
      url
      width
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    media(first: 10) {
      nodes {
        alt
        id
        mediaContentType
        previewImage {
          altText
          height
          id
          url
          width
        }
        ... on Video {
          sources {
            height
            url
            width
            mimeType
          }
        }
      }
    }
    options {
      ...option
    }
    sellingPlanGroups(first: 10) {
      edges {
        node {
          ... on SellingPlanGroup {
            ...sellingPlanGroup
          }
        }
      }
    }
    variants(first: 100) {
      nodes {
        ... on ProductVariant {
            ...variantFragment
          }
      }
    }
  }
  ${VARIANT_FRAGMENT}
  ${SELLING_PLAN_GROUP_FRAGMENT}
  ${OPTION_FRAGMENT}
` as const;

export const PRODUCT_QUERY = `#graphql
  query product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ... on Product {
        ...productFragment
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

export const PRODUCT_ITEM_QUERY = `#graphql
  query product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ... on Product {
        ...productItemFragment
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
` as const;

export const PRODUCT_METAFIELDS_QUERY = `#graphql
  query product(
    $handle: String!
    $key: String!
    $namespace: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      metafields(identifiers: {key: $key, namespace: $namespace}) {
        ...metafield
      }
    }
  }
  ${METAFIELD_FRAGMENT}
` as const;

export const PRODUCTS_QUERY = `#graphql
  query Products(
    $query: String
    $first: Int
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query, after: $endCursor) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      nodes {
        ... on Product {
          ...productItemFragment
        }
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
` as const;
