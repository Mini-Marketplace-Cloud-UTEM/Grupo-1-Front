import React, { useState, useRef } from "react";
import {
  Star,
  Minus,
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";

const SIMILAR = [
  {
    id: 1,
    title: "Auriculares Sport BT",
    price: 59990,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "Earbuds Premium TWS",
    price: 89990,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: 3,
    title: "Headset Gaming RGB",
    price: 149990,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: 4,
    title: "Auriculares Studio MK2",
    price: 199990,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: 5,
    title: "Banda Deportiva Audio",
    price: 39990,
    rating: 4.1,
    image:
      "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=400&h=400&fit=crop&auto=format",
  },
];

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            className={
              s <= Math.floor(rating)
                ? "fill-[#2eca7f] text-[#2eca7f]"
                : s - rating < 1
                  ? "fill-[#2eca7f]/50 text-[#2eca7f]/50"
                  : "fill-transparent text-[#a0a0a0]"
            }
          />
        ))}
      </div>
      <span className="text-xs text-[#a0a0a0]">
        {rating}{" "}
        {count !== undefined && `(${count.toLocaleString()})`}
      </span>
    </div>
  );
}

function SimilarCard({ item, fmt }) {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border flex-shrink-0 w-44 md:w-auto group transition-transform hover:-translate-y-1 duration-200">
      <div className="bg-[#2a2a2a] aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 flex flex-col gap-2">
        <p
          className="text-sm font-semibold text-foreground leading-tight line-clamp-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {item.title}
        </p>
        <StarRating rating={item.rating} />
        <p
          className="text-base font-bold text-[#2eca7f]"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {fmt(item.price)}
        </p>
        <button className="w-full bg-[#2eca7f]/10 hover:bg-[#2eca7f] text-[#2eca7f] hover:text-[#0a1a10] text-xs font-semibold py-2 rounded-lg transition-colors duration-200 border border-[#2eca7f]/30 hover:border-[#2eca7f] cursor-pointer">
          Comprar
        </button>
      </div>
    </div>
  );
}

export default function ProductDetail({ product, onBack, onAddToCart }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const carouselRef = useRef(null);

  const displayProduct = {
    id: product?.id || '1',
    category: product?.category || "Electrónica & Audio",
    title: product?.name || "Auriculares Inalámbricos Pro Max X1",
    price: product?.price || 129990,
    originalPrice: product?.price ? Math.round(product.price * 1.3) : 179990,
    rating: 4.7,
    reviews: 248,
    stock: product ? product.inStock : true,
    description:
      "Experimenta un rendimiento de nivel profesional con este producto de alta calidad. Con tecnología de última generación, diseño ergonómico y durabilidad sobresaliente, es el compañero perfecto para tus necesidades cotidianas. Fabricado con los mejores estándares para garantizar comodidad y satisfacción durante horas de uso continuo.",
    images: product?.imageUrl 
      ? [
          product.imageUrl,
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=700&h=700&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&h=700&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=700&h=700&fit=crop&auto=format",
        ]
      : [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=700&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=700&h=700&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&h=700&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=700&h=700&fit=crop&auto=format",
        ],
  };

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: dir === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const discount = Math.round(
    ((displayProduct.originalPrice - displayProduct.price) /
      displayProduct.originalPrice) *
      100,
  );

  const fmt = (n) => '$' + n.toLocaleString('es-CL');

  const handleAddToCart = () => {
    if (onAddToCart && product) {
      // In the target app, addToCart accepts product. We can call it quantity times if needed,
      // or just call it once to add the product. Let's do it once or in a loop.
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Breadcrumbs / Back button ── */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 text-sm text-[#a0a0a0]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-foreground px-3 py-1.5 rounded-lg border border-border transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} /> Volver al catálogo
        </button>
        <span className="text-border">/</span>
        <span className="text-[#2eca7f] truncate max-w-[200px]">
          {displayProduct.title}
        </span>
      </div>

      {/* ── Main product section ── */}
      <main className="max-w-7xl mx-auto px-4 pb-32 md:pb-10">
        <div className="md:grid md:grid-cols-[60%_40%] md:gap-10 md:items-start">
          {/* ── Left: Image gallery ── */}
          <div className="md:sticky md:top-20">
            {/* Main image */}
            <div className="relative bg-[#2a2a2a] rounded-xl overflow-hidden aspect-square md:aspect-[4/3]">
              <img
                src={displayProduct.images[activeImage]}
                alt={displayProduct.title}
                className="w-full h-full object-contain p-6 transition-opacity duration-300"
              />
              {/* Discount badge */}
              <span className="absolute top-3 left-3 bg-[#2eca7f] text-[#0a1a10] text-xs font-bold px-2.5 py-1 rounded-full">
                -{discount}%
              </span>
              {/* Wishlist */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-3 right-3 bg-[#1e1e1e]/80 backdrop-blur-sm p-2 rounded-full transition-colors hover:bg-[#2a2a2a] cursor-pointer"
              >
                <Heart
                  size={18}
                  className={
                    wishlist
                      ? "fill-[#2eca7f] text-[#2eca7f]"
                      : "text-[#a0a0a0]"
                  }
                />
              </button>
              {/* Nav arrows */}
              <button
                onClick={() =>
                  setActiveImage(
                    (p) =>
                      (p - 1 + displayProduct.images.length) %
                      displayProduct.images.length,
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#1e1e1e]/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <ChevronLeft
                  size={16}
                  className="text-[#a0a0a0]"
                />
              </button>
              <button
                onClick={() =>
                  setActiveImage(
                    (p) => (p + 1) % displayProduct.images.length,
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1e1e1e]/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <ChevronRight
                  size={16}
                  className="text-[#a0a0a0]"
                />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 mt-3">
              {displayProduct.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-1 aspect-square rounded-lg overflow-hidden bg-[#2a2a2a] border-2 transition-colors cursor-pointer ${
                    activeImage === i
                      ? "border-[#2eca7f]"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Vista ${i + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: Product details ── */}
          <div className="mt-6 md:mt-0 flex flex-col gap-5">
            {/* Category + share */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2eca7f] uppercase tracking-widest">
                {displayProduct.category}
              </span>
              <button className="text-[#a0a0a0] hover:text-foreground transition-colors p-1 cursor-pointer">
                <Share2 size={16} />
              </button>
            </div>

            {/* Title */}
            <h1
              className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {displayProduct.title}
            </h1>

            {/* Rating */}
            <StarRating
              rating={displayProduct.rating}
              count={displayProduct.reviews}
            />

            {/* Price */}
            <div className="flex items-end gap-3">
              <span
                className="text-3xl font-extrabold text-foreground"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {fmt(displayProduct.price)}
              </span>
              <span className="text-lg text-[#a0a0a0] line-through mb-0.5">
                {fmt(displayProduct.originalPrice)}
              </span>
              <span className="text-sm font-bold text-[#2eca7f] bg-[#2eca7f]/10 px-2 py-0.5 rounded-full mb-0.5">
                Ahorras {fmt(displayProduct.originalPrice - displayProduct.price)}
              </span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <CheckCircle
                size={15}
                className="text-[#2eca7f]"
              />
              <span className="text-sm font-medium text-[#2eca7f]">
                {displayProduct.stock ? "Disponible" : "Sin Stock"}
              </span>
              <span className="text-sm text-[#a0a0a0]">
                — Envío en 24–48 hs
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-[#a0a0a0] leading-relaxed">
              {displayProduct.description}
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: "Garantía 2 años" },
                { icon: Truck, label: "Envío gratis" },
                {
                  icon: RotateCcw,
                  label: "30 días devolución",
                },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-[#1e1e1e] rounded-lg p-2.5 flex flex-col items-center gap-1.5 border border-border"
                >
                  <Icon size={16} className="text-[#2eca7f]" />
                  <span className="text-[10px] text-[#a0a0a0] text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop quantity + CTA */}
            <div className="hidden md:flex flex-col gap-3 bg-[#1e1e1e] border border-border rounded-xl p-4 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#a0a0a0]">
                  Cantidad
                </span>
                <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-lg px-1 py-0.5">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="p-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors text-[#a0a0a0] hover:text-foreground cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-foreground text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors text-[#a0a0a0] hover:text-foreground cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-[#a0a0a0]">
                <span>Total</span>
                <span className="font-bold text-foreground text-base">
                  {fmt(displayProduct.price * quantity)}
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!displayProduct.stock}
                className={`w-full text-[#0a1a10] font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer ${
                  displayProduct.stock
                    ? "bg-[#2eca7f] hover:bg-[#28b872] active:bg-[#22a064]"
                    : "bg-[#555] cursor-not-allowed opacity-50"
                }`}
              >
                <ShoppingCart size={17} />
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>

        {/* ── Similar products ── */}
        <section className="mt-14">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-xl font-extrabold text-foreground"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Productos Similares
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel("left")}
                className="p-2 bg-card border border-border rounded-lg hover:border-[#2eca7f]/40 text-[#a0a0a0] hover:text-foreground transition-colors md:hidden cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="p-2 bg-card border border-border rounded-lg hover:border-[#2eca7f]/40 text-[#a0a0a0] hover:text-foreground transition-colors md:hidden cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Mobile: horizontal scroll */}
          <div
            ref={carouselRef}
            className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {SIMILAR.map((item) => (
              <SimilarCard key={item.id} item={item} fmt={fmt} />
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-5 gap-4">
            {SIMILAR.map((item) => (
              <SimilarCard key={item.id} item={item} fmt={fmt} />
            ))}
          </div>
        </section>
      </main>

      {/* ── Sticky mobile bottom bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e1e1e] border-t border-border px-4 py-3 flex items-center gap-3">
        {/* Quantity selector */}
        <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-xl px-2 py-2 flex-shrink-0">
          <button
            onClick={() =>
              setQuantity((q) => Math.max(1, q - 1))
            }
            className="p-1.5 rounded-lg hover:bg-[#3a3a3a] transition-colors text-[#a0a0a0] hover:text-foreground cursor-pointer"
          >
            <Minus size={15} />
          </button>
          <span className="w-6 text-center font-bold text-foreground text-sm">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-1.5 rounded-lg hover:bg-[#3a3a3a] transition-colors text-[#a0a0a0] hover:text-foreground cursor-pointer"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!displayProduct.stock}
          className={`flex-1 text-[#0a1a10] font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer ${
            displayProduct.stock
              ? "bg-[#2eca7f] hover:bg-[#28b872] active:bg-[#22a064]"
              : "bg-[#555] cursor-not-allowed opacity-50"
          }`}
        >
          <ShoppingCart size={17} />
          Agregar — {fmt(displayProduct.price * quantity)}
        </button>
      </div>
    </div>
  );
}
