// ✏️ Product categories - used by the shop menu and the admin form.
// If you change these, also change the list in server/server.js.
export const categories = [
  { name: "TV & Home Audio", icon: "📺" },
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
  { name: "Hardware & Electrical", icon: "🔌" },
  { name: "Lighting Products", icon: "💡" },
  { name: "Vehicle Accessories", icon: "🚗" },
  { name: "Home & Décor", icon: "🛋️" },
];

export function subCategoriesOf(categoryName) {
  return categories.find((c) => c.name === categoryName)?.subCategories ?? [];
}
