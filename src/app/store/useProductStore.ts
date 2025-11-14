import { create } from "zustand";
import {
  AverageRatingType,
  HomeProductType,
  ProductDetailsType,
  ReviewType,
} from "@/types/product.types";
import {
  getFilteredProduct,
  getProductDetails,
  getProductReviews,
} from "@/actions/product.action";
import { ProductCategory } from "@prisma/client";

interface ProductStore {
  products: HomeProductType[];
  filterSearch: string;
  filterCategory: ProductCategory | string;
  filterPrice: string;
  loading: boolean;

  individualProduct: ProductDetailsType | null;
  loadingIndividualProduct: boolean;

  reviews: ReviewType[];
  averageRating: AverageRatingType | null;
  loadingReview: boolean;

  setFilterSearch: (val: string) => void;
  setFilterCategory: (val: string) => void;
  setFilterPrice: (val: string) => void;

  fetchProducts: () => void;
  fetchIndividualProduct: (productId: string) => void;

  fetchReview: (productId: string) => void;
  resetReview: () => void;
}

const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filterSearch: "",
  filterCategory: "",
  filterPrice: "",
  loading: true,

  individualProduct: null,
  loadingIndividualProduct: true,

  reviews: [],
  averageRating: null,

  loadingReview: true,

  setFilterSearch: (val) => {
    set({ filterSearch: val });
  },

  setFilterCategory: (val) => {
    set({ filterCategory: val });
    get().fetchProducts();
  },

  setFilterPrice: (val) => {
    set({ filterPrice: val });
    get().fetchProducts();
  },

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const { filterSearch, filterCategory, filterPrice } = get();
      let priceSort: "asc" | "desc" | undefined;
      if (filterPrice === "low-to-high") priceSort = "asc";
      else if (filterPrice === "high-to-low") priceSort = "desc";

      const res = await getFilteredProduct(
        filterSearch,
        filterCategory as ProductCategory,
        priceSort
      );
      set({ products: res });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  fetchIndividualProduct: async (productId) => {
    try {
      set({ loadingIndividualProduct: true });
      const product = await getProductDetails(productId);
      set({ individualProduct: product });
    } catch (error) {
      console.log(error);
    } finally {
      set({ loadingIndividualProduct: false });
    }
  },

  fetchReview: async (productId) => {
    set({ loadingReview: true });
    const res = await getProductReviews(productId);

    console.log(res);

    if (res.success) {
      set({ reviews: res.reviews, averageRating: res.aggregate });
    }

    set({ loadingReview: false });
  },

  resetReview: async () => {
    set({ reviews: [] });
  },
}));

export default useProductStore;
