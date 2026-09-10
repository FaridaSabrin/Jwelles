import { formatINR } from "../utils/formatINR";
export default function Price({ price, originalPrice, discountPercentage, size = "md" }) {
  const hasDiscount = Number(originalPrice) > Number(price);

  return (
    <div className={`price-block price-${size}`}>
      <span className="price-current">{formatINR(price)}</span>
      {hasDiscount && <span className="price-original">{formatINR(originalPrice)}</span>}
      {hasDiscount && Number(discountPercentage) > 0 && (
        <span className="price-discount">{Math.round(discountPercentage)}% off</span>
      )}
    </div>
  );
}




