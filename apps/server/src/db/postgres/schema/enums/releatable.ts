import { pgEnum } from "drizzle-orm/pg-core";

export const rateableTypeEnum = pgEnum("rateable_type", [
	"car",
	"driver",
	"ride",
	"passenger",
	"booking",
]);
