import { count } from "drizzle-orm";
import { db } from "@db/index";
import { carsToCarFeatures } from "@db/schema/cars";
import type { DB } from "@/db";

export const getCarsCountByFeatureId = async (db: DB, featureId: string) => {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(carsToCarFeatures)
    .where((carsToCarFeatures) => carsToCarFeatures.carFeatureId.eq(parseInt(featureId, 10)));

  return result.value;
};