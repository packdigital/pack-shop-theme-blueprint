import {useCallback, useEffect, useState} from 'react';
import {useProduct} from '@shopify/hydrogen-react';
import {useSearchParams} from '@remix-run/react';

import {AddToCart, QuantitySelector} from '~/components';
import {useSettings} from '~/hooks';

import {BackInStock} from './BackInStock';
import {ProductOptions} from './ProductOptions';
import type {ProductDetailsProps} from './Product.types';

export function ProductDetails({
  isModal,
  prices,
  product,
  selectedVariant,
  swatches,
}: ProductDetailsProps) {
  const {product: productSettings} = useSettings();
  const {selectedOptions, setSelectedOption} = useProduct();
  const [searchParams] = useSearchParams();

  const [quantity, setQuantity] = useState(1);

  const hideOptions =
    product.variants?.nodes?.length === 1 &&
    product.variants?.nodes?.[0]?.title === 'Default Title';
  const enabledNotifyMe = productSettings?.backInStock?.enabled ?? true;
  const {enabledQuantitySelector = false} = {...productSettings?.addToCart};
  const selectedOptionsMap = selectedOptions as Record<string, string>;

  const handleDecrement = useCallback(() => {
    if (quantity === 1) return;
    setQuantity(quantity - 1);
  }, [quantity]);

  const handleIncrement = useCallback(() => {
    setQuantity(quantity + 1);
  }, [quantity]);

  useEffect(() => {
    if (!enabledQuantitySelector) return undefined;
    return () => {
      setQuantity(1);
    };
  }, [enabledQuantitySelector]);

  const notifyMeIsFocused = searchParams.has('notifyMeFocused');

  return (
    <div className="flex flex-col gap-5">
      {!hideOptions && (
        <ProductOptions
          product={product}
          selectedOptionsMap={selectedOptionsMap}
          setSelectedOption={setSelectedOption}
          swatches={swatches}
        />
      )}

      {!isModal && (
        <div className="flex items-center gap-3">
          {enabledQuantitySelector && (
            <QuantitySelector
              disableDecrement={quantity === 1}
              handleDecrement={handleDecrement}
              handleIncrement={handleIncrement}
              productTitle={product.title}
              quantity={quantity}
            />
          )}

          <AddToCart
            containerClassName="flex-1"
            isPdp
            price={prices.price}
            quantity={quantity}
            selectedVariant={selectedVariant}
          />
        </div>
      )}

      {selectedVariant &&
        !selectedVariant.availableForSale &&
        enabledNotifyMe && (
          <BackInStock
            isFocused={notifyMeIsFocused}
            selectedVariant={selectedVariant}
          />
        )}

      <div
        dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
        className="text-sm [&>:last-child]:mb-0 [&_a]:underline [&_blockquote]:pl-8 [&_h1]:mb-3 [&_h2]:mb-3 [&_h3]:mb-3 [&_h4]:mb-3 [&_h5]:mb-3 [&_h6]:mb-3 [&_li>p]:mb-0 [&_li]:mb-2 [&_ol>li]:list-decimal [&_ol]:mb-3 [&_ol]:pl-8 [&_p]:mb-3 [&_ul>li]:list-disc [&_ul]:mb-3 [&_ul]:pl-8"
      />
    </div>
  );
}

ProductDetails.displayName = 'ProductDetails';
