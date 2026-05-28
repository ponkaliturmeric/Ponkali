import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5 text-center">
      <p className="text-gold text-[11px] font-semibold tracking-[0.35em] uppercase mb-6">404</p>
      <h1 className="text-[48px] md:text-[64px] font-extrabold text-dark-brown tracking-tight leading-none mb-5">
        Page Not Found
      </h1>
      <p className="text-gray-500 text-[17px] max-w-md leading-relaxed mb-10">
        The page you&apos;re looking for doesn&apos;t exist. It may have been moved, or you may have mistyped the address.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="bg-dark-brown text-cream px-9 py-4 rounded-full font-semibold text-[15px] hover:bg-black transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="border border-dark-brown/20 text-dark-brown px-9 py-4 rounded-full font-semibold text-[15px] hover:bg-dark-brown hover:text-cream transition-colors"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
