"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import useProductStore from "@/app/store/useProductStore";
import { Tag } from "lucide-react";
import { HomeProductType } from "@/types/product.types";
import Link from "next/link";

const DisplayProducts = () => {
  const products: HomeProductType[] = useProductStore(
    (state) => state.products
  );
  const loading = useProductStore((state) => state.loading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="flex gap-4 flex-wrap justify-start items-start">
      {loading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <Skeleton className="h-[219px] w-[219px] rounded-md" />
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-[219px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))
      ) : products?.length === 0 ? (
        <div className="col-span-full text-center text-gray-600">
          No Products Found
        </div>
      ) : (
        products?.map((product, index) => (
          <Link
            href={`/product/${product.id}`}
            key={index}
            className="bg-[#82a0aa] w-[15rem] h-[23rem] p-5 rounded-md shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col items-center justify-start"
          >
            <div className="w-[14rem] h-[100rem] overflow-hidden rounded-md bg-white flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <article className="text-2xl mt-3 text-[#334a52] font-bold text-center grid grid-rows-4 gap-1 h-full">
              <p className="tracking-wider row-span-2 line-clamp-2 overflow-hidden text-ellipsis">
                {product.name}
              </p>
              <p className="text-lg text-[#9b4500] font-bold">
                Rs. {product.price}
              </p>
              <p className="text-sm text-slate-300 bg-gray-700/30 w-max backdrop-blur-3xl flex items-center gap-2 mx-auto px-2 py-1 rounded-md border-0">
                <Tag className="size-3" />
                {product.category}
              </p>
            </article>
          </Link>
        ))
      )}
    </div>
  );
};

export default DisplayProducts;
