import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // Format as BDT (Bangladeshi Taka) with English digits
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getRandomTestimonials(count: number = 3) {
  const testimonials = [
    {
      text: "The birthday cake I ordered exceeded all expectations! Not only was it stunningly beautiful, but it tasted amazing too. Everyone at the party was impressed!",
      name: "Jennifer D.",
      role: "Loyal Customer",
      initials: "JD",
      rating: 5,
    },
    {
      text: "I've tried many bakeries, but SweetBite's sourdough bread is hands down the best in town. I'm now a regular customer and can't imagine getting my bread anywhere else.",
      name: "Michael T.",
      role: "Bread Enthusiast",
      initials: "MT",
      rating: 5,
    },
    {
      text: "Their macarons are simply divine! Perfectly crisp on the outside, chewy inside, and the flavors are so creative. The online ordering process was smooth and delivery was prompt.",
      name: "Sarah K.",
      role: "Dessert Lover",
      initials: "SK",
      rating: 4.5,
    },
    {
      text: "We ordered a selection of pastries for our office meeting and everyone was impressed. Great quality, fresh, and delivered on time.",
      name: "David R.",
      role: "Business Customer",
      initials: "DR",
      rating: 5,
    },
    {
      text: "The gluten-free options at SweetBite are incredible! I can finally enjoy desserts without worrying about my dietary restrictions.",
      name: "Lisa M.",
      role: "Gluten-Free Customer",
      initials: "LM",
      rating: 5,
    },
  ];

  // Shuffle array
  const shuffled = [...testimonials].sort(() => 0.5 - Math.random());

  // Get first 'count' elements
  return shuffled.slice(0, count);
}
