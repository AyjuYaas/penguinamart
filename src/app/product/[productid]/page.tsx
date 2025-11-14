import { Metadata } from "next";
import ProductDetails from "./ProductDetails";
import { prisma } from "@/lib/prisma"; // or your data fetching method

export const dynamic = "force-dynamic";

type Props = {
  params: {
    productid: string;
  };
};

// Dynamically generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.productid },
    select: { name: true },
  });

  return {
    title: product?.name || "Product Details",
  };
}

// Render your component
const ProductPage = ({ params }: Props) => {
  return <ProductDetails params={params} />;
};

export default ProductPage;
