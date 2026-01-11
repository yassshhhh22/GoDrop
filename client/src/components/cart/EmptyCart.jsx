import React from "react";
import { Link } from "react-router-dom";
import { MdShoppingCart, MdHome } from "react-icons/md";

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-center max-w-md">
        {/* Message with Icon */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
            <MdShoppingCart size={32} className="text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 text-left">
            Your cart is empty
          </h2>
        </div>
        <p className="text-secondary-600 mb-8 mt-6">
          Looks like you haven't added anything to your cart yet. Start shopping
          to fill it up!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            <MdHome size={20} />
            <span>Start Shopping</span>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-xs text-secondary-500">
          <div className="text-center">
            <div className="text-2xl mb-1">🚚</div>
            <p>Fast Delivery</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">💰</div>
            <p>Best Prices</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">✅</div>
            <p>Quality Products</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
