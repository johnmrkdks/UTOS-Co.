import {
	bookingStatusEnum,
	paymentMethodEnum,
	rateableTypeEnum,
	userRoleEnum,
} from "@/db/postgres/schema/enums";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const UserRoleEnumSchema = createSelectSchema(userRoleEnum);
export type UserRoleEnum = z.infer<typeof UserRoleEnumSchema>;

export const BookingStatusEnumSchema = createSelectSchema(bookingStatusEnum);
export type BookingStatusEnum = z.infer<typeof BookingStatusEnumSchema>;

export const RateableTypeEnumSchema = createSelectSchema(rateableTypeEnum);
export type RateableTypeEnum = z.infer<typeof RateableTypeEnumSchema>;

export const PaymentMethodEnumSchema = createSelectSchema(paymentMethodEnum);
export type PaymentMethodEnum = z.infer<typeof PaymentMethodEnumSchema>;
