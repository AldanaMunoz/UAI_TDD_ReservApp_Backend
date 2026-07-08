import "dotenv/config";
import axios from "axios";
import fs from "node:fs/promises";
import path from "node:path";
import db from "../db/db";

type FoodRow = {
    id: number;
    name: string;
    imageUrl: string | null;
};

type PexelsSearchResponse = {
    photos: {
        alt?: string;
        src: {
            large?: string;
            medium?: string;
            original?: string;
        };
    }[];
};

type ScriptOptions = {
    apply: boolean;
    force: boolean;
    limit: number;
    delayMs: number;
};

const UPLOADS_ROOT = path.resolve("uploads");
const FOOD_UPLOADS_FOLDER = "foods";

function readOptions(): ScriptOptions {
    const args = process.argv.slice(2);

    const limitArg = args.find((arg) => arg.startsWith("--limit="));
    const delayArg = args.find((arg) => arg.startsWith("--delay="));

    return {
        apply: args.includes("--apply"),
        force: args.includes("--force"),
        limit: limitArg ? Math.max(1, Number(limitArg.split("=")[1]) || 10) : 10,
        delayMs: delayArg ? Math.max(0, Number(delayArg.split("=")[1]) || 0) : 750,
    };
}

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

function getPublicFoodImageUrl(foodId: number, fileName: string) {
    return `/uploads/${FOOD_UPLOADS_FOLDER}/${foodId}/${fileName}`;
}

function getLocalPathFromImageUrl(imageUrl?: string | null) {
    if (!imageUrl?.startsWith("/uploads/")) return undefined;

    const relativePath = imageUrl.replace(/^\/uploads\//, "");
    const fullPath = path.resolve(UPLOADS_ROOT, relativePath);

    if (!fullPath.startsWith(UPLOADS_ROOT)) return undefined;
    return fullPath;
}

async function deleteLocalImage(imageUrl?: string | null) {
    const filePath = getLocalPathFromImageUrl(imageUrl);
    if (!filePath) return;

    await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
    });
}

async function wait(ms: number) {
    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function findFoods(options: ScriptOptions): Promise<FoodRow[]> {
    const whereSql = options.force
        ? "1 = 1"
        : "(url_imagen IS NULL OR url_imagen = '')";

    const [rows] = await db.execute(
        `SELECT
            id,
            nombre AS name,
            url_imagen AS imageUrl
         FROM comidas
         WHERE ${whereSql}
         ORDER BY id ASC
         LIMIT ${options.limit}`
    );

    return rows as FoodRow[];
}

async function searchImage(foodName: string) {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
        throw new Error("Falta configurar PEXELS_API_KEY en .env");
    }

    const response = await axios.get<PexelsSearchResponse>(
        "https://api.pexels.com/v1/search",
        {
            headers: {
                Authorization: apiKey,
            },
            params: {
                query: `${foodName} comida`,
                per_page: 1,
                page: 1,
                locale: "es-ES",
                orientation: "landscape",
            },
            timeout: 15000,
        }
    );

    const photo = response.data.photos[0];
    return photo?.src.large || photo?.src.medium || photo?.src.original;
}

async function downloadJpg(imageUrl: string) {
    const response = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
    });

    const contentType = String(response.headers["content-type"] || "");

    if (!contentType.includes("image/jpeg")) {
        throw new Error(`La imagen descargada no es JPG. Content-Type: ${contentType}`);
    }

    return Buffer.from(response.data);
}

async function saveImage(food: FoodRow, imageBuffer: Buffer) {
    const folder = path.join(UPLOADS_ROOT, FOOD_UPLOADS_FOLDER, String(food.id));
    const fileName = `food-${food.id}-${slugify(food.name)}.jpg`;
    const filePath = path.join(folder, fileName);
    const publicUrl = getPublicFoodImageUrl(food.id, fileName);

    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(filePath, imageBuffer);

    await db.execute(
        `UPDATE comidas
         SET url_imagen = :imageUrl
         WHERE id = :id`,
        {
            id: food.id,
            imageUrl: publicUrl,
        }
    );

    if (food.imageUrl && food.imageUrl !== publicUrl) {
        await deleteLocalImage(food.imageUrl);
    }

    return publicUrl;
}

async function main() {
    const options = readOptions();
    const foods = await findFoods(options);

    console.log(
        options.apply
            ? `Modo real: se procesaran ${foods.length} comidas`
            : `Modo simulacion: se revisaran ${foods.length} comidas sin modificar archivos ni DB`
    );

    for (const food of foods) {
        try {
            console.log(`\n[${food.id}] ${food.name}`);

            const imageUrl = await searchImage(food.name);

            if (!imageUrl) {
                console.log("  Sin resultados de imagen");
                continue;
            }

            console.log(`  Imagen encontrada: ${imageUrl}`);

            if (!options.apply) {
                console.log("  Simulacion: no se descarga ni actualiza DB");
                await wait(options.delayMs);
                continue;
            }

            const imageBuffer = await downloadJpg(imageUrl);
            const publicUrl = await saveImage(food, imageBuffer);

            console.log(`  Guardada y asignada: ${publicUrl}`);
            await wait(options.delayMs);
        } catch (error: any) {
            console.log(`  Error: ${error?.message || error}`);
        }
    }

    await db.end();
}

main().catch(async (error) => {
    console.error(error?.message || error);
    await db.end();
    process.exit(1);
});
