/// <reference types="@remix-run/dev" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type {Storefront} from '@shopify/hydrogen';
import type {Pack} from '@pack/hydrogen';

import type {OxygenEnv} from '~/lib/utils';

import type {HydrogenSession} from './server';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    PACK_CONTENT_ENVIRONMENT?: string;
    PACK_PUBLIC_TOKEN: string;
    PACK_SECRET_TOKEN: string;
    PACK_STOREFRONT_ID: string;
    PRIMARY_DOMAIN: string;
    PRIVATE_SHOPIFY_CHECKOUT_DOMAIN?: string;
    PRIVATE_SHOPIFY_STORE_MULTIPASS_SECRET?: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PUBLIC_STOREFRONT_API_VERSION: string;
    PUBLIC_STOREFRONT_ID: string;
    SESSION_SECRET: string;
  }

  interface Window {
    ENV?: Record<string, string>;
    unHover?: ReturnType<typeof setTimeout> | null;
    dataLayer?: any[];
    // Meta pixel
    fbq?: Function;
    // TikTok pixel
    ttq?: Record<string,any>;
    // Elevar specific, if applicable to project
    ElevarDataLayer?: any[];
    ElevarInvalidateContext?: () => void;
    // Fueled specific, if applicable to project
    fueled?: any;
    fueledConfig?: Record<string, any>;
  }
}

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    session: HydrogenSession;
    storefront: Storefront;
    env: Env;
    pack: Pack;
    oxygen: OxygenEnv;
  }
}
