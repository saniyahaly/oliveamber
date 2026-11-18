
"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  price: string | number;
  description: string;
};

export default function Home() {
  // Menu data
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Add form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // Edit form
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  // Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // READ - Get menu items from NeonDB
  async function fetchMenu() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/menu", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load menu.");
      }

      setMenu(data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load menu."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  // CREATE - Add a dish
  async function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not add dish.");
      }

      setName("");
      setPrice("");
      setDescription("");

      await fetchMenu();
      setMessage("New dish added successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add dish."
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE - Remove a dish
  async function deleteItem(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this dish?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/menu", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not delete dish.");
      }

      setMenu((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (editingItem?.id === id) {
        cancelEditing();
      }

      setMessage("Dish deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete dish."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Open edit form with existing dish details
  function startEditing(item: MenuItem) {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditDescription(item.description);
    setError("");
    setMessage("");
  }

  // Scroll to edit form once it appears
  useEffect(() => {
    if (editingItem) {
      document.getElementById("edit-section")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [editingItem]);

  // Cancel editing
  function cancelEditing() {
    setEditingItem(null);
    setEditName("");
    setEditPrice("");
    setEditDescription("");
  }

  // UPDATE - Save edited dish to NeonDB
  async function updateItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingItem) return;

    setUpdating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingItem.id,
          name: editName,
          price: Number(editPrice),
          description: editDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not update dish.");
      }

      setMenu((previous) =>
        previous.map((item) =>
          item.id === editingItem.id ? data.item : item
        )
      );

      cancelEditing();
      setMessage("Menu item updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update dish."
      );
    } finally {
      setUpdating(false);
    }
  }

  function formatPrice(value: string | number) {
    return Number(value).toLocaleString("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#24382C]">
      {/* NAVBAR */}
      <header className="flex items-center justify-between bg-white px-6 py-6 shadow-sm md:px-16">
        <a href="#home" className="font-serif text-2xl font-bold">
          OLIVE <span className="text-[#B99B70]">&</span> EMBER
        </a>

        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <a href="#home" className="hover:text-[#B99B70]">
            Home
          </a>
          <a href="#menu" className="hover:text-[#B99B70]">
            Our Menu
          </a>
          <a href="#add" className="hover:text-[#B99B70]">
            Add Dish
          </a>
        </nav>

        <a
          href="#menu"
          className="bg-[#24382C] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#3A5844]"
        >
          Explore Menu
        </a>
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative flex min-h-[550px] items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,28,19,0.94), rgba(15,28,19,0.4)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85')",
        }}
      >
        <div className="max-w-4xl px-6 py-20 text-white md:px-20">
          <p className="mb-6 text-xs font-bold tracking-[0.25em] text-[#D4B486]">
            WELCOME TO OLIVE & EMBER
          </p>

          <h1 className="mb-7 font-serif text-5xl leading-tight md:text-7xl">
            Delicious food.
            <br />
            <span className="italic text-[#D4B486]">
              Beautiful moments.
            </span>
          </h1>

          <p className="mb-9 max-w-lg text-sm leading-8 text-gray-200">
            Experience unforgettable flavours with freshly prepared
            dishes, crafted with passion and served with care.
          </p>

          <a
            href="#menu"
            className="inline-block bg-[#D4B486] px-8 py-4 text-sm font-semibold text-[#24382C] hover:bg-[#E7CBA3]"
          >
            Discover Our Menu ↗
          </a>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="bg-white px-6 py-20 text-center">
        <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#B99B70]">
          FRESHLY PREPARED WITH LOVE
        </p>

        <h2 className="mb-5 font-serif text-4xl md:text-5xl">
          A taste worth remembering.
        </h2>

        <p className="mx-auto max-w-2xl text-sm leading-8 text-gray-500">
          Explore a thoughtfully prepared collection of delicious
          meals, made using fresh ingredients and inspired by the
          joy of sharing good food.
        </p>
      </section>

      {/* DYNAMIC MENU SECTION */}
      <section id="menu" className="px-6 py-24 md:px-16">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-[#B99B70]">
              EXPLORE OUR SELECTION
            </p>

            <h2 className="mb-4 font-serif text-4xl md:text-5xl">
              Our Restaurant Menu
            </h2>

            <p className="text-sm text-gray-500">
              Discover our freshly prepared signature dishes.
            </p>
          </div>

          <span className="w-fit rounded-full border border-gray-300 px-5 py-3 text-xs font-semibold">
            {menu.length} Menu Items
          </span>
        </div>

        {/* SUCCESS AND ERROR MESSAGES */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-lg bg-green-100 p-4 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* MENU CARDS */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading menu items...
          </div>
        ) : menu.length === 0 ? (
          <div className="rounded-lg bg-white p-16 text-center">
            <h3 className="font-serif text-2xl">
              No menu items available
            </h3>
            <p className="mt-3 text-sm text-gray-500">
              Add your first dish using the form below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menu.map((item, index) => (
              <article
                key={item.id}
                className="flex min-h-[300px] flex-col border border-[#E7E4DC] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-[10px] font-bold tracking-widest text-[#B99B70]">
                    FRESHLY MADE
                  </span>
                </div>

                <div className="my-6 text-3xl text-[#B99B70]">
                  ✦
                </div>

                <h3 className="mb-3 font-serif text-2xl">
                  {item.name}
                </h3>

                <p className="mb-7 flex-1 text-sm leading-7 text-gray-500">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
                  <span className="text-lg font-bold">
                    Rs. {formatPrice(item.price)}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* EDIT BUTTON */}
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="rounded-md border border-[#C8D9C5] bg-[#EDF4EA] px-4 py-2 text-xs font-semibold text-[#2D6542] transition hover:bg-[#DDEBDD]"
                    >
                      Edit
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === item.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* EDIT ITEM FORM */}
      {editingItem && (
        <section
          id="edit-section"
          className="bg-[#EAEFE7] px-6 py-16 md:px-16"
        >
          <div className="mx-auto max-w-2xl rounded-xl bg-white p-7 shadow-lg md:p-10">
            <p className="mb-3 text-xs font-bold tracking-widest text-[#B99B70]">
              UPDATE YOUR MENU
            </p>

            <h2 className="mb-3 font-serif text-3xl">
              Edit Menu Item
            </h2>

            <p className="mb-8 text-sm text-gray-500">
              Update the details of {editingItem.name}.
            </p>

            <form onSubmit={updateItem} className="space-y-6">
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-2 block text-xs font-bold tracking-wider"
                >
                  DISH NAME
                </label>

                <input
                  id="edit-name"
                  type="text"
                  required
                  maxLength={150}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-price"
                  className="mb-2 block text-xs font-bold tracking-wider"
                >
                  PRICE (PKR)
                </label>

                <input
                  id="edit-price"
                  type="number"
                  required
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="mb-2 block text-xs font-bold tracking-wider"
                >
                  DESCRIPTION
                </label>

                <textarea
                  id="edit-description"
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(e.target.value)
                  }
                  className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-md bg-[#24382C] px-6 py-4 text-sm font-semibold text-white hover:bg-[#3A5844] disabled:opacity-50"
                >
                  {updating
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={updating}
                  className="rounded-md border border-gray-300 px-6 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ADD ITEM FORM */}
      <section
        id="add"
        className="grid grid-cols-1 items-center gap-12 bg-[#24382C] px-6 py-24 md:grid-cols-2 md:px-16"
      >
        <div>
          <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#D4B486]">
            MANAGE RESTAURANT MENU
          </p>

          <h2 className="mb-6 font-serif text-5xl leading-tight text-white">
            Add something
            <br />
            <span className="italic text-[#D4B486]">
              delicious.
            </span>
          </h2>

          <p className="max-w-md text-sm leading-8 text-gray-300">
            Add a new dish to your restaurant menu.
            All changes are saved in the NeonDB PostgreSQL
            database.
          </p>

          <p className="mt-8 text-xs text-[#D4B486]">
            ✓ Database-powered menu management
          </p>
        </div>

        <div className="bg-white p-7 shadow-xl md:p-10">
          <h3 className="mb-2 font-serif text-3xl">
            Add New Menu Item
          </h3>

          <p className="mb-8 text-sm text-gray-500">
            Enter the details of your new dish.
          </p>

          <form onSubmit={addItem} className="space-y-6">
            <div>
              <label
                htmlFor="dish-name"
                className="mb-2 block text-xs font-bold tracking-wider"
              >
                DISH NAME
              </label>

              <input
                id="dish-name"
                type="text"
                required
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken Alfredo Pasta"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label
                htmlFor="dish-price"
                className="mb-2 block text-xs font-bold tracking-wider"
              >
                PRICE (PKR)
              </label>

              <input
                id="dish-price"
                type="number"
                required
                min="0"
                max="99999999.99"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label
                htmlFor="dish-description"
                className="mb-2 block text-xs font-bold tracking-wider"
              >
                DESCRIPTION
              </label>

              <textarea
                id="dish-description"
                required
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe the dish..."
                className="w-full resize-y rounded border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-green-700"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-between bg-[#24382C] px-6 py-4 text-sm font-semibold text-white hover:bg-[#3A5844] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add to Menu"}
              <span>↗</span>
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col justify-between gap-5 bg-[#17271D] px-6 py-12 text-white md:flex-row md:items-center md:px-16">
        <div>
          <h3 className="mb-2 font-serif text-xl font-bold">
            OLIVE <span className="text-[#D4B486]">&</span>{" "}
            EMBER
          </h3>

          <p className="text-xs text-gray-400">
            Good food brings us together.
          </p>
        </div>

        <p className="text-xs text-gray-400">
          © 2026 Olive & Ember
        </p>

        <p className="text-xs text-gray-400">
          Next.js + Tailwind CSS + NeonDB
        </p>
      </footer>
    </main>
  );
}
