import {Image, Link, Spinner} from '~/components';
import {useAddToCart, useProductModal, useVariantPrices} from '~/hooks';
import type {AspectRatio} from '~/lib/types';

import type {CartUpsellItemProps} from '../Cart.types';

export function CartUpsellItem({
  aspectRatioType,
  manualAspectRatio,
  closeCart,
  isOnlyUpsell,
  product,
}: CartUpsellItemProps) {
  const {openProductUrl} = useProductModal({product});

  const selectedVariant = product.variants?.nodes?.[0];

  const {buttonText, cartIsUpdating, isAdding, isSoldOut, handleAddToCart} =
    useAddToCart({
      selectedVariant,
    });

  const {price, compareAtPrice} = useVariantPrices(selectedVariant);

  const image = product.featuredImage;
  const isUpdatingClass = isAdding || cartIsUpdating ? 'cursor-default' : '';
  const aspectRatio =
    aspectRatioType === 'manual'
      ? manualAspectRatio
      : image?.width && image?.height
      ? (`${image.width}/${image.height}` as AspectRatio)
      : manualAspectRatio;

  return (
    <div
      className={`flex items-center justify-center gap-4 ${
        isOnlyUpsell ? 'px-4' : 'px-10'
      }`}
    >
      <Link
        aria-label={product.title}
        onClick={closeCart}
        tabIndex={-1}
        to={openProductUrl}
      >
        <Image
          data={{
            ...image,
            altText: product.title,
          }}
          aspectRatio={aspectRatio}
          width="40"
          isStatic
        />
      </Link>

      <div className="flex max-w-[25rem] flex-1 flex-col gap-2">
        <Link
          aria-label={product.title}
          className="self-start"
          onClick={closeCart}
          to={openProductUrl}
        >
          <h4 className="theme-heading text-xs">{product.title}</h4>
        </Link>

        <div className="flex items-center justify-between gap-4">
          <button
            aria-label={buttonText}
            className={`text-underline theme-text-color-faded text-xs ${isUpdatingClass}`}
            disabled={!!isSoldOut}
            onClick={handleAddToCart}
            type="button"
          >
            {isAdding ? (
              <div className="flex h-4 items-center justify-center px-6">
                <Spinner width="12" color="gray" />
              </div>
            ) : (
              buttonText
            )}
          </button>

          <div className="flex flex-1 flex-wrap justify-end gap-x-1">
            {compareAtPrice && (
              <p className="theme-text-color-faded text-xs line-through">
                {compareAtPrice}
              </p>
            )}
            <p className="text-xs">{price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

CartUpsellItem.displayName = 'CartUpsellItem';
