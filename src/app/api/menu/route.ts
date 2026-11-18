
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export const runtime = "nodejs";

// GET: Read all menu items
export async function GET() {
  try {
    const sql = getDatabase();

    const items = await sql`
      SELECT id, name, price, description
      FROM menu_items
      ORDER BY id DESC
    `;

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("GET error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// POST: Add a new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const price = Number(body.price);

    if (
      !name ||
      name.length > 150 ||
      !description ||
      body.price === "" ||
      body.price === null ||
      body.price === undefined ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(Math.round(price * 100)) ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.000001 ||
      price > 99999999.99
    ) {
      return NextResponse.json(
        { success: false, error: "Enter valid dish details" },
        { status: 400 }
      );
    }

    const sql = getDatabase();

    const result = await sql`
      INSERT INTO menu_items (name, price, description)
      VALUES (${name}, ${price}, ${description})
      RETURNING id, name, price, description
    `;

    return NextResponse.json(
      { success: true, item: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to add dish" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an existing menu item
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const sql = getDatabase();

    const result = await sql`
      DELETE FROM menu_items
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dish not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dish deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete dish" },
      { status: 500 }
    );
  }
}

 // PUT: Update an existing menu item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const id = Number(body.id);
    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const price = Number(body.price);

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      !name ||
      name.length > 150 ||
      !description ||
      body.price === "" ||
      body.price === null ||
      body.price === undefined ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 99999999.99 ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.000001
    ) {
      return NextResponse.json(
        { success: false, error: "Enter valid menu details" },
        { status: 400 }
      );
    }

    const sql = getDatabase();

    const result = await sql`
      UPDATE menu_items
      SET name = ${name},
          price = ${price},
          description = ${description}
      WHERE id = ${id}
      RETURNING id, name, price, description
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: result[0],
      message: "Menu item updated successfully",
    });
  } catch (error) {
    console.error("PUT error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update dish" },
      { status: 500 }
    );
  }
}

 