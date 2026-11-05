// ✏️ Product categories - used by the shop menu and the admin form.
// If you change these, also change the list in server/server.js.
export const categories = [
  { name: "TV & Audio", icon: "📺" },
  { name: "CCTV & Security", icon: "📹" },
  {
    name: "Kitchen Appliances",
    icon: "🍳",
    subCategories: [
      "Rice Cooker",
      "Multi Cooker",
      "Toaster",
      "Air Fryer",
      "Blender",
      "Kettle",
    ],
  },

  {
    name: "Home Appliances",
    icon: "🏠",
    subCategories: ["Iron", "Fan"],
  },
  {
    name: "Lighting Products",
    icon: "💡",
    subCategories: ["Torch"],
  },
  { name: "Vehicle Accessories", icon: "🚗" },
  { name: "Hardware & Electrical", icon: "🔌" },
  { name: "Gift & Décor", icon: "🎁" },
];

export function subCategoriesOf(categoryName) {
  return categories.find((c) => c.name === categoryName)?.subCategories ?? [];
}
