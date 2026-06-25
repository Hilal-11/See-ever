export interface Product {
  asin: string;
  title: string;
  imgUrl: string;
  productURL: string;

  stars: number;
  reviews: number;

  price: number;
  listPrice: number;

  category_id: number;

  isBestSeller: boolean;
  boughtInLastMonth: number;
}

export interface Clothes {
  id: number;
  title: string;
  brand: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviews: number;
  color: string;
  sizes: string[];
  gender: string;
  image_url: string;
  tags: string;
}
