// scripts/seed.ts
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { OrderStatus, PaymentStatus, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

function generateNepaliPhoneNumber(): string {
  // Format: 98[7-9][0-9]{7} - Nepali mobile numbers start with 98 followed by 7/8/9
  const prefixes = [
    "980",
    "981",
    "982",
    "984",
    "985",
    "986",
    "974",
    "975",
    "976",
    "988",
  ];
  const prefix = faker.helpers.arrayElement(prefixes);
  const suffix = faker.string.numeric(7 - prefix.length + 1); // Adjust for prefix length
  return prefix + suffix;
}

// Helper functions with proper typing
function randomDateFromPast5Months(): Date {
  const now = new Date();
  const fiveMonthsAgo = new Date();
  fiveMonthsAgo.setMonth(now.getMonth() - 5);

  return faker.date.between({
    from: fiveMonthsAgo,
    to: now,
  });
}

function getRandomEnumValue<T extends Record<string, string | number>>(
  enumObj: T
): T[keyof T] {
  const enumValues = Object.values(enumObj);
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex] as T[keyof T];
}

// Type definitions for our intermediate data structures
type ProductData = {
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  description: string;
  image: string;
};

type UserWithOrders = {
  id: string;
  createdAt: Date;
  orders: Array<{
    id: string;
    createdAt: Date;
    status: OrderStatus;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }>;
};

async function main() {
  // Clear existing data in proper order to maintain referential integrity
  const deleteOperations = [
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany(),
    prisma.admin.deleteMany(),
  ];

  await Promise.all(deleteOperations);

  // Create products with proper typing
  const productData: ProductData[] = [
    {
      name: "Men's Cotton T-Shirt",
      category: "CLOTHES",
      price: 1490,
      quantity: 100,
      description: "Soft cotton round-neck tee available in multiple colors",
      image: "tshirt.jpg",
    },
    {
      name: "Basmati Rice - 5kg",
      category: "GROCERIES",
      price: 900,
      quantity: 50,
      description: "Premium quality basmati rice",
      image: "rice.jpg",
    },
    {
      name: "Wireless Headphones",
      category: "ELECTRONICS",
      price: 3500,
      quantity: 30,
      description: "Noise cancelling wireless headphones",
      image: "headphones.jpg",
    },
    {
      name: "Running Shoes",
      category: "SHOES",
      price: 4500,
      quantity: 40,
      description: "Comfortable running shoes with cushioning",
      image: "shoes.jpg",
    },
    {
      name: "Coffee Table",
      category: "FURNITURE",
      price: 6500,
      quantity: 15,
      description: "Modern wooden coffee table",
      image: "table.jpg",
    },
    {
      name: "Face Cream",
      category: "BEAUTY",
      price: 1200,
      quantity: 60,
      description: "Moisturizing face cream",
      image: "cream.jpg",
    },
    {
      name: "Dog Food",
      category: "PETSUPPLIES",
      price: 1500,
      quantity: 45,
      description: "Nutritious dog food",
      image: "dogfood.jpg",
    },
    {
      name: "Programming Book",
      category: "BOOKS",
      price: 1800,
      quantity: 25,
      description: "Guide to modern programming",
      image: "book.jpg",
    },
  ];

  const createdProducts = await Promise.all(
    productData.map((data) => prisma.product.create({ data }))
  );
  const productIds = createdProducts.map((p) => p.id);

  // Create users with associated data
  const users: UserWithOrders[] = [];

  for (let i = 0; i < 20; i++) {
    const dob = faker.date.birthdate({ min: 18, max: 65, mode: "age" });
    const createdAt = randomDateFromPast5Months();

    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        dob,
        createdAt,
      },
      select: {
        id: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            createdAt: true,
            status: true,
            items: {
              select: {
                productId: true,
                quantity: true,
                price: true,
              },
            },
          },
        },
      },
    });

    users.push(user);

    // Create 1-3 orders per user
    const orderCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < orderCount; j++) {
      const orderCreatedAt = faker.date.between({
        from: user.createdAt,
        to: new Date(),
      });

      const orderStatus = getRandomEnumValue(OrderStatus);

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          totalAmount: 0, // Will be updated after items are added
          location: faker.location.streetAddress(),
          phone: generateNepaliPhoneNumber(),
          status: orderStatus,
          createdAt: orderCreatedAt,
        },
      });

      // Add 1-4 items to each order
      const itemCount = faker.number.int({ min: 1, max: 4 });
      let totalAmount = 0;
      const selectedProducts = faker.helpers.arrayElements(
        productIds,
        itemCount
      );

      await Promise.all(
        selectedProducts.map(async (productId) => {
          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { price: true },
          });
          if (!product) throw new Error(`Product ${productId} not found`);

          const quantity = faker.number.int({ min: 1, max: 3 });
          const price = product.price * quantity;
          totalAmount += price;

          return prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId,
              quantity,
              price,
            },
          });
        })
      );

      // Update order total amount
      await prisma.order.update({
        where: { id: order.id },
        data: { totalAmount },
      });

      // Create payment for some orders (70% chance)
      if (faker.datatype.boolean({ probability: 0.7 })) {
        let paymentStatus: PaymentStatus;
        switch (orderStatus) {
          case "CANCELLED":
            paymentStatus = "FAILED";
            break;
          default:
            paymentStatus = getRandomEnumValue(PaymentStatus);
            // Ensure we don't get REFUNDED for non-delivered orders
            if (paymentStatus === "REFUNDED" && orderStatus !== "DELIVERED") {
              paymentStatus = "PAID";
            }
        }

        await prisma.payment.create({
          data: {
            transactionId: faker.string.uuid(),
            orderId: order.id,
            amount: totalAmount,
            status: paymentStatus,
            createdAt: faker.date.between({
              from: orderCreatedAt,
              to: new Date(),
            }),
          },
        });
      }

      // Create reviews for some products (50% chance)
      if (faker.datatype.boolean({ probability: 0.5 })) {
        const reviewProductId = faker.helpers.arrayElement(selectedProducts);
        await prisma.review.create({
          data: {
            userId: user.id,
            productId: reviewProductId,
            comment: faker.lorem.sentences(2),
            rating: faker.number.int({ min: 1, max: 5 }),
            image: faker.datatype.boolean({ probability: 0.3 })
              ? faker.image.urlLoremFlickr({ category: "product" })
              : null,
            createdAt: faker.date.between({
              from: orderCreatedAt,
              to: new Date(),
            }),
          },
        });
      }
    }

    // Add some items to cart for some users (60% chance)
    if (faker.datatype.boolean({ probability: 0.6 })) {
      const cartItemCount = faker.number.int({ min: 1, max: 5 });
      const cartProducts = faker.helpers.arrayElements(
        productIds,
        cartItemCount
      );

      await Promise.all(
        cartProducts.map((productId) =>
          prisma.cart.create({
            data: {
              userId: user.id,
              productId,
              quantity: faker.number.int({ min: 1, max: 3 }),
              createdAt: faker.date.between({
                from: user.createdAt,
                to: new Date(),
              }),
            },
          })
        )
      );
    }
  }

  // Create admin user with proper typing
  await prisma.admin.create({
    data: {
      name: "Admin User",
      email: "admin@pinguinasmart.com",
      password: "$2a$10$K7VYVz7Uv5J3J3Z3Z3Z3Z.D3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3", // hashed "password123"
      createdAt: new Date(),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
